# Time Conversions
This mod converts time.
![](https://github.com/slothyace/bmods-acedia/blob/main/.documentation/.images/timeConversions.png)

## Requirements
| Requirements |
| --- |
| NIL |

## Documentation
Inputs
| Component | Documentation | 
| --- | --- |
| `Time` | Can be a decimal / integer number. Allows a string if `Time Input Unit` has been set to `Parse Time (Custom)`. |
| `Time Input Unit` | If set to the `Parse Time (Custom)` mode, it'll parse the time using common units. Otherwise, set a time input unit. |
| `Output As` | Set a time output unit. If set to `Custom` output, you would need to follow a syntax. |
| `Store As` | Store the output string as. |

### Input Time Parsing
Extractions
| Time | Time Scale | Extraction Regex |
| --- | --- |
| Year | 365.25 days | `/(\d+(?:\.\d+)?) ?(years?\b\|yrs?\b\|yy?\b)/gi` |
| Month | 30.44 days | `/(\d+(?:\.\d+)?) ?(mo(nths?)?\b\|mths?\b)/gi` |
| Week | 7 days | `/(\d+(?:\.\d+)?) ?(weeks?\b\|wks?\b\|w\b)/gi` |
| Day | 24 hours |`/(\d+(?:\.\d+)?) ?(days?\b\|dd?\b)/gi` | 
| Hour | 60 minutes | `/(\d+(?:\.\d+)?) ?(hours?\b\|hrs?\b\|hh?\b)/gi` |
| Minute | 60 seconds | `/(\d+(?:\.\d+)?) ?(minutes?\b\|mins?\b\|mm?\b)/gi` |
| Second | 1000 milliseconds |`/(\d+(?:\.\d+)?) ?(seconds?\b\|secs?\b\|ss?\b)/gi` |
| Millisecond | 1/1000 seconds | `/(\d+(?:\.\d+)?) ?(milliseconds?\b\|ms\b)/gi` |

### Custom Output Syntax
| Time Scale | Syntax |
| --- | --- |
| Year | `YY` |
| Month | `MO` |
| Week | `WK` |
| Day | `DD` |
| Hour | `HH` |
| Minute | `MM` |
| Second | `SS` |
| Millisecond | `MS` |
