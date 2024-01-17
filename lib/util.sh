#!/usr/bin/env bash
# Copyright (c) 2023-present, Дід Alik and the Kids {{{1
#
# This script is licensed under the Apache License, Version 2.0, found in the
# LICENSE file in the root directory of this source tree.
##

function cc () { # clone our repo, checkout its main branch {{{1
  local repo_url=$1
  local repo_local_name=$2
  git clone $repo_url $repo_local_name > /dev/null 2>&1
  cd $repo_local_name
  git checkout main > /dev/null 2>&1
}

function start_local_dev () { # for svc $1, log to $LOCALDEV_LOG, $! >> .pids2kill {{{1
  local svc_name=$1
  local svc_count=$2
  local svc_dir=$DAK_HOME/svc/${svc_name}
  local dev_fifo=${svc_dir}/dev.fifo
  local dev_script=${svc_dir}/${svc_name}-dev.sh
  local grep_pattern='wrangler-dist/cli.js dev'

  echo "- $0 checking local svc ${svc_name}..." >> $LOCALDEV_LOG
  if [ $(ps -ef|grep "${svc_name}-dev.sh"|wc -l) -eq 1 ]; then
    echo "- $0 starting local svc ${svc_name}..." >> $LOCALDEV_LOG
    $dev_script >> $LOCALDEV_LOG &
    echo $! >> .pids2kill
    echo $svc_name > $dev_fifo
    tail -f $LOCALDEV_LOG | while read; do
      [[ "$REPLY" == *Ready\ on\ http://127.0.0.1:* ]] && break
    done
  fi
  echo "- $0 local svc ${svc_name} is ON." >> $LOCALDEV_LOG
}

function usage () { # {{{1
  cat << USAGE

    USAGE:

source $0

    CONTENTS:

USAGE
  cat $0 | grep function | head -n -1
}

(return 0 2> /dev/null) || usage

# Thanks to: {{{1
# - https://stackoverflow.com/questions/17420994/how-can-i-match-a-string-with-a-regex-in-bash
#
##
