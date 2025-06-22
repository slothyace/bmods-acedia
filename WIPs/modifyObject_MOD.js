modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Modify JSON Object"
  },
  aliases: ["Modify Object"],
  modules: [],
  category: "JSON",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [,
    {
      element: "variable",
      storeAs: "originalJSON",
      name: "JSON",
    },
    {
      element: "menu",
      storeAs: "modifications",
      name: "Modifications",
      types: {
        modifications: "modifications"
      },
      max: 1000,
      UItypes: {
        modifications: {
          data: {},
          name: "Path",
          preview: "`${option.data.jsonAction.value}`",
          UI: [
            {
              element: "typedDropdown",
              storeAs: "jsonAction",
              name: "Action",
              choices: {
                create: {name: "Create/Replace Element", field: true, placeholder: "path.to.element"},
                delete: {name: "Delete Element", field: true, placeholder: "path.to.element"},
              },
            },
            "-",
            {
              element: "largeInput",
              storeAs: "content",
              name: "Content | Only Applicable If Creating/Replacing An Element"
            },
            "-",
            {
              element: "",
              html: `
                <button
                  style="width: fit-content"
                  class="hoverablez"
                  onclick="
                          const content = document.getElementById('content').value;
                          const btext = this.querySelector('#buttonText');

                          if (!this.dataset.fixedSize) {
                            this.style.width = this.offsetWidth + 'px';
                            this.style.height = this.offsetHeight + 'px';
                            this.dataset.fixedSize = 'true';
                          }

                          try {
                            JSON.parse(content);
                            this.style.background = '#28a745';
                            btext.textContent = 'Valid';
                            document.getElementById('content').value = JSON.stringify(JSON.parse(content), null, 2);
                            let textLength = document.getElementById('content').value.length;
                            document.getElementById('content').focus();
                            document.getElementById('content').setSelectionRange(textLength, textLength);
                          } catch (error) {
                            this.style.background = '#dc3545';
                            btext.textContent = 'Invalid';
                          }
                          setTimeout(() => {
                            this.style.background = '';
                            btext.textContent = 'Validate JSON';
                          }, 500);
                        "
                >
                  <btext id="buttonText"> Validate JSON </btext>
                </button>
              `
            },
            {
              element: "text",
              text: `Wrap your variables with double quotes ("), i.e "\${tempVars('varName')}".`
            },
          ]
        }
      }
    },
    "-",
    {
      element: "store",
      storeAs: "modifiedJson",
      name: "Store Modified JSON As"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Make ${values.modifications.length} Modifications To JSON Object ${values.originalJSON.type}(${values.originalJSON.value})`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    
  }
}