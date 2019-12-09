penvpn --config /etc/openvpn/ovpn.conf --daemon
curl https://www.ovpn.com/v2/api/client/ptr # Expect: {"status":true,"ip":"the external ip","ptr":"PTR for the IP address"}

