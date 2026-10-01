#!/bin/sh
# Подстраховка: периодически перепубликовывает роль/VIP/приоритет этого узла
# в MQTT - на случай, если брокер потерял retained-сообщение (перезапуск
# mosquitto), а VRRP-транзишена не было, чтобы keepalived сам их переопубликовал.
# Вызывается по cron (/etc/cron.d/wb-ha-role-heartbeat): * * * * *
#
# PRIORITY - per-node константа (150 на 111, 100 на 112), как и в wb-ha-notify.sh.
PRIORITY=150
VIP_ADDR="192.168.143.115"

if ip addr show wlan0 2>/dev/null | grep -q "$VIP_ADDR"; then
    ROLE="active"
    HELD_VIP="$VIP_ADDR"
else
    ROLE="standby"
    HELD_VIP="-"
fi
mosquitto_pub -r -t "/devices/system/controls/role" -m "$ROLE"
mosquitto_pub -r -t "/devices/system/controls/vip" -m "$HELD_VIP"
mosquitto_pub -r -t "/devices/system/controls/priority" -m "$PRIORITY"
