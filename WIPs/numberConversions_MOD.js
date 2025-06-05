modVersion = "s.v2.0"
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
  aliases: ["Format Numbers"],
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
        Normal: {name: "Plain Number | Example: 123.456", field: false},
        Standardise: {name: "Standard Expression | Example: 12,345.678", field: false},
        SciNot: {name: "Scientific Notation | Example: 1.234×10⁵", field: false},
        Generalise: {name: "Generalised Expression | Example: 1.23 + K/M/B/T", field: false},
        Log2r: {name: "Log2 | Example: 2³+1", field: false},
        PrimeFactors: {name: "Prime Factors | Example: 2³×3²x11", field: false},
        Price: {name: "Price | Example: 1234.56", field: false},
        GeneralisedPrice: {name: "Standardized Price | Example: 1,234.56", field: false},
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

    function toSuperscript(num){
      const superscriptMap = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
        "+": "⁺",
        "-": "⁻",
        "=": "⁼",
        "(": "⁽",
        ")": "⁾"
      }
      return String(num).split("").map(char => superscriptMap[char] || char).join("")
    }

    let input = 0
    let convertedTxt
    try {
      input = evaluate(bridge.transf(values.OriginalNum))
      let number = parseFloat(input)

      if (!isNaN(number)){
        switch(conversionType){
          case "Normal":
            convertedTxt = number
            break

          case "Standardise":
            convertedTxt = number.toLocaleString()
            break

          case "SciNot":
            let sciNotValues = number.toExponential().split("e")
            let exponent = parseInt(sciNotValues[1])
            let coefficient = parseFloat(sciNotValues[0]).toFixed(3)
            convertedTxt = `${coefficient}×10${toSuperscript(exponent)}`
            break
            
          case "Generalise":
            if (number >= 1e12){convertedTxt = (number / 1e12).toFixed(2) + "T"}
            else if (number >= 1e9){convertedTxt = (number / 1e9).toFixed(2) + "B"}
            else if (number >= 1e6){convertedTxt = (number / 1e6).toFixed(2) + "M"}
            else if (number >= 1e3){convertedTxt = (number / 1e9).toFixed(2) + "K"}
            else {convertedTxt = number}
            break

          case "Log2r":
            const expressAsP2 = (num)=>{
              let exponent = Math.floor(Math.log2(num))
              let highestPowerOf2 = Math.pow(2, exponent)
              let remainder = num - highestPowerOf2
              if (remainder === 0){
                return `2${toSuperscript(exponent)}`
              } else {
                return `2${toSuperscript(exponent)}+${remainder}`
              }
            }
            convertedTxt = expressAsP2(number)
            break

          case "PrimeFactors":
            const expressAsPF = (num)=>{
              let factors = []
              let divisor = 2
              
              while (num >= 2){
                if (num % divisor === 0){
                  factors.push(divisor)
                  num = num / divisor
                } else {
                  divisor++
                }
              }

              let reducedFactors = []
              let factorMap = {}
              for (let factor of factors){
                factorMap[factor] = (factorMap[factor] || 0) + 1
              }

              for (let [prime, count] of Object.entries(factorMap)){
                if (count > 1){
                  reducedFactors.push(`${prime}${toSuperscript(count)}`)
                } else {
                  reducedFactors.push(`${prime}`)
                }
              }

              return reducedFactors.join("×")
            }

            convertedTxt = expressAsPF(number)
            break

          case "Price":
            convertedTxt = number.toFixed(2)
            break

          case "GeneralisedPrice":
            let parts = number.toFixed(2).split(".")
            let formattedDollar = parseInt(parts[0]).toLocaleString()
            convertedTxt = `${formattedDollar}.${parts[1]}`
            break
        }

        if (decimalNotation == "comma"){
          convertedTxt = switchDecNotation(convertedTxt)
        }
      } else {
        convertedTxt = "Number Format Not Supported."
      }

      bridge.store(values.store, convertedTxt)
      
    } catch (error) {
      bridge.store(values.store, error)
    }
  }
}
