/** @type import("..").NS */
let ns = null;

import { serversFile } from '/helpers/globals';

export const loadServers = async _ns => {
  ns = _ns;
  return JSON.parse(ns.read(serversFile));
};

export default loadServers;
