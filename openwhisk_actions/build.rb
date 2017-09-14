require 'sshkit_addon'
require 'dotenv'
Dotenv.load

password = "password"
master_ip = %Q(192.168.xx.xx)
master = SSHKit::Host.new :hostname => master_ip, :user => "username", :password => password

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
whisk_system_auth = %Q(789c46b1-71f6-4ed5-8c54-816aa4f8c502:abczO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP)
whisk_default_auth = "23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP"

def find_service_port svc_name, internal_port, namespace = "default"
  internal_port = internal_port.to_s
  ports = {}  
  line = capture %Q(kubectl get svc -n #{namespace}| grep #{svc_name})
  line.split[3].split(/,/).each do |entry|
    i, e,  = entry.split /:|\//
    ports[i]=e
  end
  # p ports

  ports[internal_port]
end

namespace "a" do
  @task_index=0

  mon_package_name = "FCEX-Mon" #foreign currency exchange rate mon
  act_package_name = "FCEX-Act"
  desc "create package"
  task "#{next_task_index}_create_package" do
    on master do |host|
      execute %Q(wsk -i package create #{mon_package_name})
      execute %Q(wsk -i package create #{act_package_name})
    end
  end

  def install_zip_methods master, target_dir, main_code, action_name,mon_package_name
    on master do |host|
      working_dir = target_dir + "/monitor"
      cmds = ShellCommandConstructor.construct_command %Q{
        rm -rf #{working_dir}
        mkdir -p #{working_dir}
      }
      execute cmds

      %w(package.json helper.js).each do |file|
        upload! file, "#{working_dir}/#{file}"
      end

      upload! main_code, "#{working_dir}/index.js" #upload as main

      cmds = ShellCommandConstructor.construct_command %Q{
         cd #{working_dir}
         npm install
         zip -r #{action_name}.zip index.js package.json helper.js node_modules
         wsk -i action update #{mon_package_name}/#{action_name} --kind nodejs:6 #{action_name}.zip
      }
      execute cmds
    end
  end

  [
    {
      main_code: "lastNValue.js",
      action_name: "lastNValue",
    },
    {
      main_code: "lastValue.js",
      action_name: "lastValue",
    },
    {
      main_code: "sma.js",
      action_name: "SMA",
    },
    {
      main_code: "ema.js",
      action_name: "EMA",
    },
    {
      main_code: "macd.js",
      action_name: "MACD",
    },
    {
      main_code: "monitor.js",
      action_name: "currencyMonitor"
    },
    {
      main_code: "send2frontend.js",
      action_name: "Send2Frontend"
    },
  ].each do |hash|
    main_code = hash[:main_code]
    action_name = hash[:action_name]

    desc "install #{action_name}"
    task "#{next_task_index}_install_#{action_name}" do
      install_zip_methods master,target_dir, main_code, action_name,mon_package_name
    end
  end


  desc "install purchase and sell actions"
  task "#{next_task_index}_install_actions" do
    on master do |host|
      working_dir = target_dir + "/monitor"
      {
        purchase: "purchase.js",
        sell: "sell.js",
        notify: "notify.js",
      }.each do |act, file|
        upload! file, "#{working_dir}/#{file}"
        cmds = ShellCommandConstructor.construct_command %Q{
          wsk -i action update #{act_package_name}/#{act.capitalize} --kind nodejs:6 #{working_dir}/#{file}
        }
        execute cmds
      end
    end
  end

  desc "test action"
  task "#{next_task_index}_test_action" do
    on master do |host|
      execute %Q(wsk -i action invoke #{mon_package_name}/currencyMonitor -b -p currency "US Dollar" -p formula 'value > 1.1 &&  macd_12_26__signal_9 < 0.001' -p action FCEX-Act/Sell -p amount 501)
    end
  end

end
