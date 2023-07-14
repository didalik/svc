#!/usr/bin/env bash

function cc () { # clone our repo, checkout its main branch {{{1
  local repo_url=$1
  local repo_local_name=$2
  git clone $repo_url $repo_local_name > /dev/null 2>&1
  cd $repo_local_name
  git checkout main > /dev/null 2>&1
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
