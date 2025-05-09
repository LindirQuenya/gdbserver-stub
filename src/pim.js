
/**
 * Copyright (c) Tatsuo Nomura <tatsuo.nomura@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GDBCommandHandler } from './gdb-command-handler.js';
import { ok, stopped, error, currentThreadId, threadIds, ERROR_BAD_ACCESS_SIZE_FOR_ADDRESS, unsupported } from './gdb-server-stub.js';
import Debug from 'debug';
import { createConnection } from 'net';
import PromiseSocket, {TimeoutError} from "promise-socket";

const trace = Debug('gss:pim:trace');

export class PIM extends GDBCommandHandler {
  pyConn;

  constructor(conn) {
    super();
    this.pyConn = conn;
  }

  async sendpy(packet) {
    await this.pyConn.write(JSON.stringify(packet));
    let data = await this.pyConn.read();
    console.log(data);
    const result = JSON.parse(data);
    if (result['status'] != 'ok') {
      console.log("Non-ok status returned!");
      console.log(result);
      return 0;
    }
    console.log(result['data']);
    return result['data'];
  }

  async handleInterruption() {
    trace('interrupted')
    this.emit('stopped', stopped(5));
  }

  async handleHaltReason() {
    trace('haltReason')
    // Use stop reason SIGTRAP(5).
    return stopped(5);
  }

  async handleReadRegisters() {
    trace("readRegisters");
    const result = await this.sendpy({'type': 'g', 'data': {}});
    return ok(result);
  }

  async handleReadMemory(address, length) {
    trace("readMemory");
    const result = await this.sendpy({'type': 'm', 'data': {address, length}});
    return ok(result);
  }

  async handleStep(address) {
    trace("step");
    const result = await this.sendpy({'type': 's', 'data': {}});
    return ok(result);
  }

  async handleContinue(address) {
    trace("continue");
    const result = await this.sendpy({'type': 'c', 'data': {}});
    return ok(result);
  }

  async handleQSupported(features) {
    return ok('QStartNoAckMode+')
  }

  async handleStartNoAckMode() {
    return ok();
  }
  async handleWriteMemory(address,value) {
    trace("writeMemory");
    const result = await this.sendpy({'type': 'M', 'data': {address,value}});
    return ok();
  }
  async handleWriteRegisters(register,value) {
    trace("writeRegisters");
    const result = await this.sendpy({'type':'G', 'data':{register,value}});
    return ok();
  }
}
