modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Check User Data",
  },
  aliases: [],
  modules: [],
  category: "User Data",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "user",
      storeAs: "user",
      name: "User",
    },
    {
      element: "input",
      storeAs: "dataName",
      name: "Data Name",
    },
    {
      element: "input",
      storeAs: "defaultValue",
      name: "Default Value",
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "comparisonType",
      name: "Comparison",
      choices: {
        equals: { name: "Equals", field: true, placeholder: "Equals To" },
        equalsExact: { name: "Equals Exactly", field: true, placeholder: "Equals Exactly To" },
        notEquals: { name: "Doesn't Equal", field: true, placeholder: "Doesn't Equal To" },
        exists: { name: "Exists", field: false },
        lessThan: { name: "Less Than", field: true, placeholder: "Less Than" },
        greaterThan: { name: "Greater Than", field: true, placeholder: "Greater Than" },
        equalOrLessThan: { name: "Equal Or Less Than", field: true, placeholder: "Equal Or Less Than" },
        equalOrGreaterThan: { name: "Equal Or Greater Than", field: true, placeholder: "Equal Or Greater Than" },
        isNumber: { name: "Is Number", field: false },
        matchesRegex: { name: "Matches Regex", field: true, placeholder: "Regex" },
      },
    },
    "-",
    {
      element: "condition",
      storeAs: "ifTrue",
      storeActionsAs: "ifTrueActions",
      name: "If True",
    },
    {
      element: "condition",
      storeAs: "ifFalse",
      storeActionsAs: "ifFalseActions",
      name: "If False",
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    let phraseMap = {
      equals: "Equals",
      equalsExact: "Equals Exactly",
      notEquals: "Doesn't Equal",
      exists: "Exists",
      lessThan: "Less Than",
      greaterThan: "Greater Than",
      equalOrLessThan: "Equal Or Less Than",
      equalOrGreaterThan: "Equal Or Greater Than",
      isNumber: "Is Number",
      matchesRegex: "Matches Regex",
    }
    return `Check If ${values.user}[${values.dataName}] ${phraseMap[values.comparisonType.type]} ${values.comparisonType.value}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    let storedData = bridge.data.IO.get()
    let dataType = "users"
    let retrieveObject = await bridge.getUser(values.user)
    let id = retrieveObject.id
    let dataName = bridge.transf(values.dataName)
    let defaultValue = bridge.transf(values.defaultValue) || undefined
    let comparisonType = bridge.transf(values.comparisonType.type)
    let comparisonValue = bridge.transf(values.comparisonType.value)
    let retrieveValue = storedData?.[dataType]?.[id]?.[dataName] || defaultValue

    let matchesCriteria = false
    switch (comparisonType) {
      case "equals": {
        if (`${retrieveValue}` == `${comparisonValue}`) {
          matchesCriteria = true
        }
        break
      }

      case "equalsExact": {
        if (retrieveValue === comparisonValue) {
          matchesCriteria = true
        }
        break
      }

      case "notEquals": {
        if (`${retrieveValue}` != `${comparisonValue}`) {
          matchesCriteria = true
        }
        break
      }

      case "exists": {
        matchesCriteria = retrieveValue != undefined || retrieveValue != null
        break
      }

      case "lessThan": {
        if (Number(retrieveValue) < Number(comparisonValue)) {
          matchesCriteria = true
        }
        break
      }

      case "greaterThan": {
        if (Number(retrieveValue) > Number(comparisonValue)) {
          matchesCriteria = true
        }
        break
      }

      case "equalOrLessThan": {
        if (Number(retrieveValue) <= Number(comparisonValue)) {
          matchesCriteria = true
        }
        break
      }

      case "equalOrGreaterThan": {
        if (Number(retrieveValue) >= Number(comparisonValue)) {
          matchesCriteria = true
        }
        break
      }

      case "isNumber": {
        if (typeof parseFloat(retrieveValue) == "number" && !isNaN(parseFloat(retrieveValue))) {
          matchesCriteria = true
        }
        break
      }

      case "matchesRegex": {
        try {
          let regex = new RegExp(comparisonValue, "i")
          matchesCriteria = regex.test(String(retrieveValue))
        } catch {
          matchesCriteria = false
        }
        break
      }
    }

    if (matchesCriteria == true) {
      await bridge.call(values.ifTrue, values.ifTrueActions)
    } else {
      await bridge.call(values.ifFalse, values.ifFalseActions)
    }
  },
}
