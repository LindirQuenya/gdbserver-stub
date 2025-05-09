/**
 * Copyright (c) Tatsuo Nomura <tatsuo.nomura@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PIM } from "./pim.js";
import { GDBServerStub } from "./gdb-server-stub.js";
import PromiseSocket, {TimeoutError} from "promise-socket";

export async function runServer() {
  const pyConn = new PromiseSocket();
//  await pyConn.connect(11111, 'localhost');
  const pim = new PIM(pyConn);
  const server = new GDBServerStub(pim);
  server.start("localhost", 2424);
}

if (process.env.NODE_ENV != 'test') {
  await runServer();
}
