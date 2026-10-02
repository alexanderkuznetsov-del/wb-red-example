#!/bin/sh
# Узел считается исправным для VRRP, если запущены wb-rules и wb-mqtt-serial
# и WB-MGE отвечает на ping. Проверка ping нужна, потому что службы могут быть
# в состоянии active, даже если у узла пропала связь с WB-MGE.
systemctl is-active --quiet wb-rules && \
systemctl is-active --quiet wb-mqtt-serial && \
ping -c 1 -W 1 192.168.143.113 >/dev/null 2>&1
