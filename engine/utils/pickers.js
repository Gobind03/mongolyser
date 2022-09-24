const { dialog } = require('electron');

exports.filePicker = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      { name: "Log Files", extensions: ["log"] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (canceled) {
    return {
      status: 404,
      message: "File path not found"
    }
  } else {
    return {
      status: 200,
      data: {
        filePath: filePaths[0]
      }
    }
  }
}