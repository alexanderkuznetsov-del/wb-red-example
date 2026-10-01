#!/bin/sh
# Ждём, пока на интерфейсе реально появится наш unicast_src_ip, прежде чем
# запускать keepalived - иначе bind() на ещё не назначенный/только что
# исчезнувший адрес роняет демон в FAULT ("src address not configured")
# без самовосстановления.
#
# Одного взгляда через ip addr show недостаточно - адрес может мелькнуть
# и на долю секунды пропасть/переустановиться (DHCP-финализация), поэтому
# требуем присутствия несколько проверок подряд, а не один раз.
#
# IP - per-node константа (свой IP на каждом узле).
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
