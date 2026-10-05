#!/bin/sh
# Ждёт появления unicast_src_ip на интерфейсе перед запуском keepalived:
# если адрес ещё не назначен или только что пропал, bind() завершается
# ошибкой, и keepalived переходит в FAULT ("src address not configured")
# без самовосстановления.
#
# Адрес может появиться и на долю секунды пропасть (завершение получения
# адреса по DHCP), поэтому скрипт ждёт, пока адрес будет на месте при
# нескольких проверках подряд (STABLE_CHECKS).
#
# Константа IP задаётся отдельно на каждом узле (свой IP).
# Имя интерфейса и IP-адрес этого узла замените на свои.
IFACE="wlan0"
IP="192.168.143.111"
TIMEOUT=30
STABLE_CHECKS=3
STABLE_INTERVAL=1

i=0
stable=0
while [ "$stable" -lt "$STABLE_CHECKS" ]; do
    if ip addr show "$IFACE" 2>/dev/null | grep -q "$IP"; then
        stable=$((stable + 1))
    else
        stable=0
    fi
    i=$((i + 1))
    if [ "$i" -ge "$TIMEOUT" ]; then
        logger -t wb-ha "wait-for-ip: timeout (${TIMEOUT}s) waiting for stable $IP on $IFACE, starting anyway"
        exit 0
    fi
    sleep "$STABLE_INTERVAL"
done
logger -t wb-ha "wait-for-ip: $IP on $IFACE stable after ${i}s"
exit 0
