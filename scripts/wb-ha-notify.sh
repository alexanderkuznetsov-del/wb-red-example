#!/bin/sh
# Вызывается keepalived при смене VRRP-состояния этого узла.
# $1: active | standby | fault
#
# PRIORITY - per-node константа, зашита напрямую (150 на 111, 100 на 112) -
# должна совпадать со значением priority в keepalived.conf этого же узла.
ROLE="$1"
PRIORITY=150
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
