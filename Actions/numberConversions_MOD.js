modVersion = "s.v1.4"
module.exports = {
  data: {
    name: "Number Conversions"
  },
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia"
  },
  category: "Numbers",
  modules: ["mathjs"],
  UI: [
    {
      element: "largeInput",
      storeAs: "OriginalNum",
      name: "Number (can be expression too)",
    },
    {
      element: "typedDropdown",
      storeAs: "convType",
      name: "Conversions",
      choices: {
        Normal: {name: "No Conversion / Plain Number", field: false},
        SciNot: {name: "Scientific Notation | Result: n×10^e, 3 d.p.", field: false},
        Standardise: {name: "Standard Expression | Result XX,XXX", field: false},
        Generalise: {name: "Generalised Expression | Result: 2 d.p. + K/M/B/T", field: false},
        Log2r: {name: "Log2 | Result: 2^n+r", field: false},
        PrimeFactors: {name: "Prime Factors", field: false},
        Price: {name: "Standard Price | Result: XXXXX.xx", field: false},
        GeneralisedPrice: {name: "Generalised Price | Result: XX,XXX.xx", field: false}
      }
    },
    {
      element: "typedDropdown",
      storeAs: "decimalNotation",
      name: "Decimal Notation",
      choices: {
        period: {name: `Period "."`, field: false},
        comma: {name: `Comma ","`, field: false},
      },
    },
    "-",
    {
      element: "store",
      storeAs: "store",
      name: "Store Result As"
    },
    "-",
    {
      element: "text",
      text: modVersion,
    }
  ],

  subtitle: (values, constants, thisAction) => {
    return `Express ${values.OriginalNum} as ${thisAction.UI.find((e) => e.element == "typedDropdown").choices[values.convType.type].name} | Stored as: ${constants.variable(values.store)}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    await client.getMods().require("mathjs");
    const { evaluate } = require("mathjs")
    let conversionType = bridge.transf(values.convType.type);
    let decimalNotation = bridge.transf(values.decimalNotation.type)
    
    const switchDecNotation = (num) => {
      let [whole, dec] = String(num).split(".")
      whole = whole.replaceAll(",",".")
      return dec? `${whole},${dec}` : whole
    }

    try {
      let input = 0;
      input = evaluate(bridge.transf(values.OriginalNum));
      let number = parseFloat(input);
      let convertedTxt;

      if (!isNaN(number)) {
        switch (conversionType) {
          case "SciNot":
            const sciNot = number.toExponential().split("e");
            if (parseInt(sciNot[1]) >= 0) {
              exponent = sciNot[1].slice(1);
            } else {
              exponent = sciNot[1]
            }
            sciNot3dp = parseFloat(sciNot[0]).toFixed(3);
            convertedTxt = `${sciNot3dp}×10^${exponent}`;
            break;
  
          case "Standardise":
            convertedTxt = number.toLocaleString();
            break;
  
          case "Generalise":
            if (number >= 1e12) convertedTxt = (number / 1e12).toFixed(2) + 'T';
            else if (number >= 1e9) convertedTxt = (number / 1e9).toFixed(2) + 'B';
            else if (number >= 1e6) convertedTxt = (number / 1e6).toFixed(2) + 'M';
            else if (number >= 1e3) convertedTxt = (number / 1e3).toFixed(2) + 'K';
            else convertedTxt = number.toFixed(1);
            break;
  
          case "Log2r":
            const expressAsPowersOf2 = (num) => {
              let power = Math.floor(Math.log2(num));
              let highestPowerOf2 = Math.pow(2, power);
              let remainder = num - highestPowerOf2;
              
              if (remainder === 0) {
                return `2^${power}`;
              } else {
                return `2^${power}+${remainder}`;
              }
            };
  
            convertedTxt = expressAsPowersOf2(number);
            break;
  
          case "PrimeFactors":
            const expressPrimeFactors = (num) => {
              const factors = [];
              let divisor = 2;
              
              while (num >= 2) {
                if (num % divisor === 0) {
                  factors.push(divisor);
                  num = num / divisor;
                } else {
                  divisor++;
                }
              }
  
              return factors.join('×');
            };
  
            convertedTxt = expressPrimeFactors(number);
            break;

          case "Normal":
            convertedTxt = number;
            break

          case "Price":
            convertedTxt = number.toFixed(2)
            break

          case "GeneralisedPrice":
            parts = number.toFixed(2).split(".")
            formatted = parseInt(parts[0]).toLocaleString()
            convertedTxt = `${formatted}.${parts[1]}`
            break
        }

        if (decimalNotation == "comma"){
          convertedTxt = switchDecNotation(convertedTxt)
        }
        bridge.store(values.store, convertedTxt);
      }
      
      else {
        bridge.store(values.store, "Number Format Not Supported.");
      }
    }

    catch (error) {
      bridge.store(values.store, error)
    }
  }
}
