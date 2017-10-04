require 'sshkit_addon'
require 'dotenv'
Dotenv.load

master_ip = "192.168.5.100"
master = SSHKit::Host.new :hostname => master_ip, :user => "ubuntu",:key => %q(C:\Tools\Kitty\mykey.openssh)

@task_index=0
def next_task_index
  @task_index += 1
  sprintf("%02d", @task_index)
end

namespace "util" do
  desc "run command"
  task :run_command, [:cmd] do |t, args|
    cmd = args.cmd
    on master do |host|
       execute cmd
    end
  end
end

target_dir = "foreign_currency_ex_flow"
working_dir = target_dir + "/frontend"

desc "upload"
task "#{next_task_index}_upload" do
  on master do |host|
    execute %Q(mkdir -p #{working_dir})
    %w(config public scripts server src .env package.json).each do |file|
      upload! file, working_dir, recursive: true
    end
  end
end

desc "build"
task "#{next_task_index}_build" do
  on master do |host|
    cmds = ShellCommandConstructor.construct_command %Q{
      cd /myapp
      npm install
      # Fix the issue of prettycron
      sed -i.old -e "/LATER_COV/c require('./later');" node_modules/later/index.js

      npm run build
    }
    content = <<~EOF
      FROM node:8.4
      
      WORKDIR /myapp
      COPY . /myapp
      
      RUN #{cmds}

      CMD ["node", "server"]
    EOF

    put content, working_dir + "/Dockerfile"
    cmds = ShellCommandConstructor.construct_command %Q{
       cd #{working_dir}
       sudo docker build -t exmonitor:0.1.0 .
    }

    execute cmds
  end
end

registry_host = "mycluster.icp"
desc "push to icp"
task "#{next_task_index}_push" do
  on master do |host|
    cmds = ShellCommandConstructor.construct_command %Q{
      sudo docker login -u admin -p admin #{registry_host}:8500
      sudo docker tag exmonitor:0.1.0 #{registry_host}:8500/zhiminwen/exmonitor:0.1.0
      sudo docker push #{registry_host}:8500/zhiminwen/exmonitor:0.1.0
    }
    execute cmds
  end
end

desc "deploy to K8s"
task "#{next_task_index}_deploy_k8s" do
  on master do |host|
    list = capture %Q( kubectl -n openwhisk get svc nginx --no-headers )
    # nginx     10.0.0.107   <nodes>   80:32318/TCP,443:30653/TCP,8443:30342/TCP   18h
    dict = {}
    list.split[3].split(/,/).each do |p_map|
      inner, outer = p_map.split /:|\//
      dict[inner] = outer
    end
    puts dict #must use string format "443"

    whisker_api_host = "192.168.5.100:#{dict["443"]}"
    k8s_token = capture %Q(kubectl get secret $(kubectl get secret | grep default | grep service-account | awk '{print $1}') -o jsonpath="{.data.token}" | base64 -d -i)

    content = <<~EOF
      apiVersion: extensions/v1beta1
      kind: Deployment
      metadata:
        name: exchange-rate-monitor
        labels:
          app: exchange-rate-monitor
      spec:
        replicas: 1
        template:
          metadata:
            labels:
              app: exchange-rate-monitor
          spec:
            containers:
              - name: exchange-rate-monitor
                image: #{registry_host}:8500/zhiminwen/exmonitor:0.1.0
                imagePullPolicy: IfNotPresent
                ports:
                  - containerPort: 80
                env:
                  - name: FRONTEND_SOCKET_URL
                    value: http://192.168.5.100:31720
                  - name: FRONTEND_SOCKET_TOPIC
                    value: monitor-tracking-data

                  - name: WHISKER_API_HOST
                    #https of whisker
                    value: "#{whisker_api_host}"
                  - name: WHISKER_KEY
                    value: 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP
                  
                  - name: FCEX_ACTION_PACKAGE
                    value: FCEX-Act
                  - name: FCEX_MONITOR_PACKAGE
                    value: FCEX-Mon
                  - name: FCEX_MONITOR_ACTION
                    value: FCEX-Mon/currencyMonitor
                  
                  - name: K8S_API_SERVER_URL
                    value: https://192.168.5.100:8001
                  - name: K8S_TOKEN
                    value: #{k8s_token}
                  - name: K8S_JOB_IMAGE
                    value: zhiminwen/wsk-client:0.1.0
                  
            imagePullSecrets:
              - name: admin.registrykey
      ---
      apiVersion: v1
      kind: Service
      metadata:
        name: exchange-rate-monitor
        labels:
          app: exchange-rate-monitor
      spec:
        type: NodePort
        ports:
          - port: 80
            targetPort: 80
            protocol: TCP
            name: http
            #use a fixed nodePort so that the deployment pod can be configured
            nodePort: 31720
        selector:
          app: exchange-rate-monitor
      
    EOF
    
    put content, file = "/tmp/exmon.yaml"
    execute %Q(sudo kubectl apply -f #{file})
  end
end
