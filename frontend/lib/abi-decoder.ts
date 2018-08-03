// Refered and modified from https://github.com/ConsenSys/abi-decoder/blob/master/index.js
import Web3 from "web3";

export class AbiDecoder {
  private state = {
    savedABIs: [],
    methodIDs: {}
  };
  private web3: Web3 = null;
  constructor(web3, abiArray) {
    this.web3 = web3;
    this.addABI(abiArray);
  }
  public getABIs() {
    return this.state.savedABIs;
  }
  public setWeb3(web3: Web3) {
    this.web3 = web3;
  }

  public addABI(abiArray) {
    if (Array.isArray(abiArray)) {
      // Iterate new abi to generate method id's
      abiArray.map(abi => {
        if (abi.name) {
          const signature = this.web3.utils.sha3(
            abi.name +
              "(" +
              abi.inputs
                .map(function(input) {
                  return input.type;
                })
                .join(",") +
              ")"
          );
          if (abi.type == "event") {
            this.state.methodIDs[signature.slice(2)] = abi;
          } else {
            this.state.methodIDs[signature.slice(2, 10)] = abi;
          }
        }
      });

      this.state.savedABIs = this.state.savedABIs.concat(abiArray);
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }

  public removeABI(abiArray) {
    if (Array.isArray(abiArray)) {
      // Iterate new abi to generate method id's
      abiArray.map(abi => {
        if (abi.name) {
          const signature = this.web3.utils.sha3(
            abi.name +
              "(" +
              abi.inputs
                .map(function(input) {
                  return input.type;
                })
                .join(",") +
              ")"
          );
          if (abi.type == "event") {
            if (this.state.methodIDs[signature.slice(2)]) {
              delete this.state.methodIDs[signature.slice(2)];
            }
          } else {
            if (this.state.methodIDs[signature.slice(2, 10)]) {
              delete this.state.methodIDs[signature.slice(2, 10)];
            }
          }
        }
      });
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }

  public getMethodIDs() {
    return this.state.methodIDs;
  }

  public decodeMethod(data) {
    const methodID = data.slice(2, 10);
    const abiItem = this.state.methodIDs[methodID];
    if (abiItem) {
      const params = abiItem.inputs.map(item => {
        return item.type;
      });
      let decoded = this.web3.eth.abi.decodeParameters(params, data.slice(10));
      const p = [];
      for (const key in decoded) {
        const param = decoded[key];
        const index = parseInt(key, 10);
        if (isNaN(index)) {
          continue;
        }
        let parsedParam = param;
        const isUint = abiItem.inputs[index].type.indexOf("uint") == 0;
        const isInt = abiItem.inputs[index].type.indexOf("int") == 0;

        if (isUint || isInt) {
          const isArray = Array.isArray(param);

          if (isArray) {
            parsedParam = param.map(val =>
              this.web3.utils.toBN(val).toString()
            );
          } else {
            parsedParam = this.web3.utils.toBN(param).toString();
          }
        }
        p.push({
          name: abiItem.inputs[index].name,
          value: parsedParam,
          type: abiItem.inputs[index].type
        });
      }
      return {
        name: abiItem.name,
        params: p
      };
    }
  }

  public padZeros(address) {
    var formatted = address;
    if (address.indexOf("0x") != -1) {
      formatted = address.slice(2);
    }

    if (formatted.length < 40) {
      while (formatted.length < 40) formatted = "0" + formatted;
    }

    return "0x" + formatted;
  }

  public decodeLogs(logs) {
    return logs.map(logItem => {
      const methodID = logItem.topics[0].slice(2);
      const method = this.state.methodIDs[methodID];
      if (method) {
        const logData = logItem.data;
        let decodedParams = [];
        let dataIndex = 0;
        let topicsIndex = 1;

        let dataTypes = [];
        method.inputs.map(input => {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
        });
        const decodedData = this.web3.eth.abi.decodeParameters(
          dataTypes,
          logData.slice(2)
        );
        // Loop topic and data to get the params
        method.inputs.map(param => {
          var decodedP = {
            name: param.name,
            type: param.type,
            value: null
          };

          if (param.indexed) {
            decodedP.value = logItem.topics[topicsIndex];
            topicsIndex++;
          } else {
            decodedP.value = decodedData[dataIndex];
            dataIndex++;
          }

          if (param.type == "address") {
            decodedP.value = this.padZeros(
              this.web3.utils.toBN(decodedP.value).toString(16)
            );
          } else if (
            param.type == "uint256" ||
            param.type == "uint8" ||
            param.type == "int"
          ) {
            decodedP.value = this.web3.utils.toBN(decodedP.value).toString(10);
          }

          decodedParams.push(decodedP);
        });

        return {
          name: method.name,
          events: decodedParams,
          address: logItem.address
        };
      }
    });
  }
}
