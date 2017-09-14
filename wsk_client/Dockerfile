FROM bitnami/minideb
RUN apt update -y && apt install curl unzip -y && cd /tmp && curl -LO https://github.com/apache/incubator-openwhisk-cli/releases/download/latest/OpenWhisk_CLI-latest-linux-amd64.zip && unzip OpenWhisk_CLI-latest-linux-amd64.zip && mv wsk /usr/local/bin && rm -rf OpenWhisk_CLI-latest-linux-amd64.zip && apt clean -y
