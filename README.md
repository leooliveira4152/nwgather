# NW Gather

I was tired of trying to manually looking for resources in New World using an old-fashioned map, so I made this things to automatically list them to us.

This things basically reads your New World coordinates and list all gatherable resources on a radar. You can type your location manually if you want to.

## Installation

You'll need to install two things:
- [Terreract](https://digi.bib.uni-mannheim.de/tesseract/tesseract-ocr-w64-setup-v5.0.0-alpha.20210811.exe) (to visually identify coordinates)
- [Node.js](https://nodejs.org/dist/v14.18.0/node-v14.18.0-x64.msi) (to run the code)

You'll need to add tesseract to environment variables too. If you don't know how to do it, check this [video](https://www.youtube.com/watch?v=2kWvk4C1pMo) (from 0:00 to around 1:50)

Then, run the following command in the project root directory:

```bash
npm install
```

This will install every project dependency.

## Usage

If you aren't sure if everything is correct with OCR, run the command below. If something like "tesseract isn't recognized as a valid command" then you probably didn't add it correctly to environment variables.
```bash
node sandbox.js
```

To properly start the code, open the file ```run.bat``` or right click ```run.ps1``` and click "open script with powershell". If you see some fancy and cool ASCII then it's probably working (if the sandbox command failed then it'll not properly recognize characters and you'll need to type coordinates manually).

If the coordinates aren't showing in your game, enter game options > visual/graphics > show FPS.

![image](https://user-images.githubusercontent.com/68027167/135266952-9d4f5442-b1f8-45a1-afea-a2e0734d9ce6.png)
Pretty straightforward, max distance sets the max distance allowed for resources to appear on radar, max tracked resources sets the max number of items showing on radar and resources to track sets which resources to track on radar (default value searches for every possible item).

![image](https://user-images.githubusercontent.com/68027167/135268068-a67eb2e9-6193-43ac-9763-6775c682ded1.png)
Manual input on. You can manually type your coordinates then click on get items to show nearby items on radar.

![image](https://user-images.githubusercontent.com/68027167/135267996-dd3d5f94-07c6-4150-a37e-3c2652b7f494.png)
Manual input off. Get items will scan in-game coordinates and try to recognize it one time. "Turn on auto-radar" will automatically do the scanning & showing process every n seconds (setted by "Radar frequency" option).

![image](https://user-images.githubusercontent.com/68027167/135269498-ba2882c4-befa-4b74-a59c-994bc2e89c1d.png)
Detection settings. Screenshot settings will change the size and position of screen capture (just toy around with the values to understand better, but you probably won't need to change anything if you screen is 1080p). OCR settings changes the way the OCR service reads the screenshot (you'll probably never change it too). Your screenshot is, well, your screenshot and good screenshot sample is a sample of what your screenshot should be. You can save your settings so you don't need to change it again the next time you run the app.

## Contributing
There's probably a lot of things to optimize and beautify, so feel free to do some PR or suggestions.