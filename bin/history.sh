#!/usr/bin/env bash

teardown () {
  kill $PID_OF_TAIL
}

trap teardown EXIT

tail -n 999999 -f history.log &
PID_OF_TAIL=$!
cat >> history.log

