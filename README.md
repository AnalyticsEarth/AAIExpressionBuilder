# AAI Expression Builder
The AAI Advanced Analytics Expression Builder is a Qlik Sense extension used to create advanced analytics expressions as master items and wrap these in to a prebuilt visualization. These visualizations use native chart types and can be edited either as a master item or un-linked and customized.

[Watch an example on YouTube](https://www.youtube.com/watch?v=xw5sH7IKWco)

## How to get started?
1. Install the extension through the Qlik Sense QMC.
1. Create an application with the data to support your visualization
1. Drag the extension onto a sheet
1. In either edit or analysis mode, click the "Open Expression Builder" button

## How to create an advanced analytics visualization?
1. Select the Advanced Analytics method you wish to implement
1. Complete the required parameters
1. Select the master items you wish to create
1. Click "Preview Master Items"
1. The code which will be generated will appear in preview
1. Click "Create Master Items"
1. Click "Close"
1. Access the master items through the standard Qlik Sense interface

## Cleanup
Because the extension is only required for application development, it should be deleted from the sheet after the visualizations have been generated. There is no dependency between the visualizations and extension after they are generated.

This way the space on your sheet can be used for important insight.

## Properties Settings
By default the extension will look for the datatype tags in the data model when listing fields for selection. In some cases, such as with dates which have not been correctly tagged on load fields may not show up. Use the _**"Show All Fields"**_ setting in the properties panel.

## More information
See the WIKI for detailed information regarding this project.
