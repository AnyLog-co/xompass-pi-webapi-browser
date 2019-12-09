#!/usr/bin/bash 
if [ $# -ne 2 ]
then
   echo "user_name password" 
   exit 1
fi

user=${1} 
passwd=${2} 

apt-get -y install openvpn unzip

cd /tmp && wget https://files.ovpn.com/ubuntu_cli/ovpn-se-gothenburg.zip && unzip ovpn-se-gothenburg.zip && mkdir -p /etc/openvpn && mv config/* /etc/openvpn && chmod +x /etc/openvpn/update-resolv-conf && rm -rf config && rm -f ovpn-se-gothenburg.zip

echo "${user}" >> /etc/openvpn/credentials
echo "${passwd}" >> /etc/openvpn/credentials

bash $HOME/xompass-pi-webapi-browser/VPN/start_vpn.sh 
