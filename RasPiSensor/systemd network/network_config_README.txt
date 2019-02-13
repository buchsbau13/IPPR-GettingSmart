>> The settings in the file 'network_config.txt' allow for a basic <<
>> network setup (choose WiFi network, set static IPs) so the      <<
>> Raspberry Pi can be accessed via SSH after the first boot.      <<
>> The available options are explained below.                      <<


[Configuration]
# Set this option to true to apply the static IP settings for the ethernet
# device in the [Ethernet] section below during the next boot
set_ethernet_static_ip = false

# Set this option to true to apply the static IP settings for the WiFi
# device in the [WiFi] section below during the next boot
set_wifi_static_ip = false

# Set this option to true to connect to the WiFi network specified in the
# [WiFi] section below during the next boot
set_wifi_network = false


# Set this option to true to reactivate the dynamic IP configuration for
# the ethernet and WiFi device during the next boot
reset_ip_config = false

# Set this option to true to remove all previously added WiFi networks from
# the configuration during the next boot
reset_wifi_config = false


[Ethernet]
# Choose a static IP address suitable for your network
static_ip = 192.168.1.234

# Set the bits of the subnet mask (255.255.255.0 equals 24 bits)
subnet_bits = 24

# Set the gateway of your network
gateway = 192.168.1.1

# Set the DNS server of your network
dns = 8.8.8.8


[WiFi]
# Set the network identifier (SSID) of your wireless network
ssid = NetworkName

# Set the password of your wireless network (WARNING! Password is saved as plain text!)
password = 12345678


# Choose a static IP address suitable for your network
static_ip = 192.168.1.123

# Set the bits of the subnet mask (255.255.255.0 equals 24 bits)
subnet_bits = 24

# Set the gateway of your network
gateway = 192.168.1.1

# Set the DNS server of your network
dns = 8.8.8.8