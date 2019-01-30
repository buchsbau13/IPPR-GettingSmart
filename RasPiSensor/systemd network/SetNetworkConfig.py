#!/usr/bin/python -u

import configparser, shutil, os

ETH_CONF_FILE = '/etc/dhcpcd.conf'
WIFI_CONF_FILE = '/etc/wpa_supplicant/wpa_supplicant.conf'
CONFIG_CHANGED = False

# Read network config file
config = configparser.ConfigParser()
with open('/boot/network_config.txt', "r") as file:
    config.read_file(file)

# Set ethernet to static IP, if desired
if config.getboolean('Configuration', 'set_ethernet_static_ip'):
    print 'Setting static IP for ethernet device...'
    ip = config.get('Ethernet', 'static_ip')
    subnet = config.get('Ethernet', 'subnet_bits')
    gateway = config.get('Ethernet', 'gateway')
    dns = config.get('Ethernet', 'dns')

    eth_config = 'interface eth0\n'
    eth_config += 'static ip_address=' + ip + '/' + subnet + '\n'
    eth_config += 'static routers=' + gateway + '\n'
    eth_config += 'static domain_name_servers=' + dns + '\n'

    with open(ETH_CONF_FILE, "w") as f:
        f.write(eth_config)

    config['Configuration']['set_ethernet_static_ip'] = 'false'
    CONFIG_CHANGED = True

# Set WiFi network, if desired
if config.getboolean('Configuration', 'set_wifi_network'):
    print 'Setting WiFi network...'
    ssid = config.get('WiFi', 'ssid')
    password = config.get('WiFi', 'password')

    wifi_config = 'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n'
    wifi_config += 'update_config=1\n'
    wifi_config += 'country=AT\n\n'
    wifi_config += 'network={\n'
    wifi_config += '  ssid="' + ssid + '"\n'
    wifi_config += '  psk="' + password + '"\n'
    wifi_config += '}\n'

    with open(WIFI_CONF_FILE, "w") as f:
        f.write(wifi_config)

    config['Configuration']['set_wifi_network'] = 'false'
    CONFIG_CHANGED = True

# Reset ethernet to dynamic IP, if desired
if config.getboolean('Configuration', 'reset_ethernet_config'):
    print 'Resetting ethernet configuration...'
    shutil.os.remove(ETH_CONF_FILE)
    shutil.copyfile(ETH_CONF_FILE + '.orig', ETH_CONF_FILE)

    config['Configuration']['reset_ethernet_config'] = 'false'
    CONFIG_CHANGED = True

# Reset WiFi configuration, if desired
if config.getboolean('Configuration', 'reset_wifi_config'):
    print 'Resetting WiFi configuration...'
    shutil.os.remove(WIFI_CONF_FILE)
    shutil.copyfile(WIFI_CONF_FILE + '.orig', WIFI_CONF_FILE)

    config['Configuration']['reset_wifi_config'] = 'false'
    CONFIG_CHANGED = True

# If network settings were altered, reset the script and reboot
if CONFIG_CHANGED:
    with open('/boot/network_config.txt', "w") as file:
        config.write(file)
    os.system('reboot')