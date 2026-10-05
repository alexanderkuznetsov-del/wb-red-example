#!/bin/sh
# Вызывается keepalived при смене состояния VRRP этого узла.
# $1: active | standby | fault
#
# Константа PRIORITY задаётся отдельно на каждом узле (150 на .111, 100 на .112)
# и должна совпадать со значением priority в keepalived.conf этого узла.
ROLE="$1"
PRIORITY=150
# Виртуальный IP-адрес замените на свой (virtual_ipaddress в keepalived.conf).
VIP_ADDR="192.168.143.115"

logger -t wb-ha "VRRP role changed to: $ROLE"
mosquitto_pub -r -t "/devices/system/controls/role" -m "$ROLE" 2>&1 | logger -t wb-ha

if [ "$ROLE" = "active" ]; then
    HELD_VIP="$VIP_ADDR"
else
    HELD_VIP="-"
fi
mosquitto_pub -r -t "/devices/system/controls/vip" -m "$HELD_VIP"
mosquitto_pub -r -t "/devices/system/controls/priority" -m "$PRIORITY"
