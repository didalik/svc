/* Copyright (c) 2023-present, Дід Alik and the Kids {{{1
 *
 * This script is licensed under the Apache License, Version 2.0, found in the
 * LICENSE file in the root directory of this source tree.
 * * */

class Codec { // {{{1
  constructor (vm) {
    this.vm = vm
  }
  static init (vm) {
    vm.c.codec = new Codec(vm)
    return new Promise((resolve, reject) => {
      Object.assign(vm.c.codec, { resolve, reject })
    });
  }
}

class Model { // {{{1
  constructor (vm) {
    this.vm = vm
  }
  static init (vm) { // {{{2
    vm.c.model = new Model(vm)
    vm.c.kit.initModel.call(vm)
    return new Promise((resolve, reject) => {
      Object.assign(vm.c.model, { resolve, reject })
    });
  }
  // }}}2
}

class View { // {{{1
  constructor (vm) {
    this.vm = vm
  }
  static init (vm) {
    vm.c.view = new View(vm)
    return new Promise((resolve, reject) => {
      Object.assign(vm.c.view, { resolve, reject })
    });
  }
}

export { // {{{1 
  Codec, Model, View, 
}
