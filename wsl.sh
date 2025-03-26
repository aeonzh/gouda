wsl_host=$(wsl.exe hostname -I)

netsh.exe interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=$wsl_host

windows_host=$(netsh.exe interface ip show address "WiFi" | grep 'IP Address' | sed -r 's/^.*IP Address:\W*//')

export REACT_NATIVE_PACKAGER_HOSTNAME=$windows_host