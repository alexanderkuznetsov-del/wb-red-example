#!/bin/sh
# Считаем узел "здоровым" для VRRP, только если жива автоматика И узел
# реально видит общий МГЕ - системные юниты могут быть "active", даже
# если сеть до МГЕ у конкретного узла деградировала.
systemctl is-active --quiet wb-rules && \
systemctl is-active --quiet wb-mqtt-serial && \
ping -c 1 -W 1 192.168.143.113 >/dev/null 2>&1
