<template>
  <div
    id="app"
    style="font-family: IM Fell DW Pic; font-size: 20px; color: white; margin-top: 0px"
  >
    <!-- LOADING -->
    <div v-if="mainLoading">
      <b-spinner variant="success" type="grow"></b-spinner>
    </div>
    <div v-else>
      <!-- MAIN SCREEN -->
      <div v-if="mainScreen">
        <el-row type="flex" align="middle" justify="space-around">
          <!-- MAIN SETTINGS -->
          <el-col
            :sm="9"
            :md="8"
            :lg="6"
            :xl="4"
            class="gray-bg hidden-xs-only"
          >
            <!-- TITLE -->
            <el-row align="middle" type="flex" justify="space-around"
              ><el-col :span="12" style="margin-top: 10px"
                ><h2 class="grid-title">Options</h2></el-col
              ></el-row
            >
            <!-- MAX DISTANCE SETTING-->
            <el-row
              >Max distance:<br /><el-input-number
                v-model="distance"
                size="small"
                :min="100"
                :max="5000"
                :step="20"
                :disabled="radarOn"
                @change="updateItems(true, false, false)"
              ></el-input-number>
            </el-row>
            <!-- MAX TRACKED ITEMS SETTING -->
            <el-row
              >Max tracked resources:<br /><el-input-number
                v-model="amount"
                size="small"
                :min="1"
                :max="50"
                :step="1"
                :disabled="radarOn"
                @change="updateItems(false, false, false)"
              ></el-input-number>
            </el-row>
            <!-- RESOURCES TO BE TRACKED SETTING -->
            <el-row>
              Resources to track:<br />
              <el-cascader
                :options="itemCascate"
                :props="{ multiple: true }"
                v-model="chosenKeys"
                placeholder="Tracking all resources"
                collapse-tags
                clearable
                :disabled="radarOn"
                @change="updateItems(true, false, false)"
              ></el-cascader>
            </el-row>
            <!-- BUTTONS -->
            <el-row style="margin-top:50px">
              <!-- UPDATE ITEMS BUTTON -->
              <el-button :disabled="radarOn" @click="updateItems()"
                >Get items</el-button
              >
              <!-- OPEN DETECTION SETTINGS BUTTON -->
              <el-button :disabled="radarOn" @click="openscreenConfig()"
                >Detection settings</el-button
              >
            </el-row>
            <!-- AUTO RADAR FREQUENCY -->
            <el-row style="margin-top:50px">
              Radar frequency (s):<br /><el-input-number
                v-model="radarFrequency"
                size="small"
                :min="0"
                :max="60"
                :step="0.1"
              ></el-input-number>
            </el-row>
            <!-- AUTO RADAR ON/OFF SWITCH -->
            <el-row type="flex" align="middle" justify="center">
              <el-col :span="14">
                Turn on auto-radar
              </el-col>
              <el-col :span="3">
                <el-switch
                  v-model="radarOn"
                  active-color="#13ce66"
                  inactive-color="#3B3B3B"
                  @change="radarProcess()"
                >
                </el-switch>
              </el-col>
            </el-row>
            <!-- AUTO RADAR INFO MESSAGES -->
            <el-row style="font-size:16px">
              <div v-if="locationMessage">
                [ {{ locationMessage.replace(/,/g, ", ") }} ]
              </div>
              <div v-if="locationErrorMessage" style="color:red">
                {{ locationErrorMessage.split("\n")[0] }}<br />{{
                  locationErrorMessage.split("\n")[1]
                }}
              </div>
            </el-row>
          </el-col>
          <!-- RADAR DISPLAY -->
          <el-col :xs="20" :sm="14" :md="14" :lg="12" :xl="12" align="middle">
            <el-row>
              <el-col>
                <div v-if="openRadar">
                  <!-- LOADING RADAR -->
                  <div v-if="loadingRadar">
                    <b-spinner type="grow" variant="success"></b-spinner>
                  </div>
                  <div v-else>
                    <!-- CREATING RADAR MODEL -->
                    <v-stage
                      ref="stage"
                      :config="{ height: stageSize, width: stageSize }"
                    >
                      <!-- ALL RADAR LINES -->
                      <v-layer>
                        <!-- RADAR CIRCLES -->
                        <div
                          v-for="(circle, index) in radar"
                          v-bind:key="'circle' + index"
                        >
                          <v-circle
                            :config="{
                              x: stageSize / 2,
                              y: stageSize / 2,
                              radius: circle,
                              stroke: '#1EEF56',
                            }"
                          />
                        </div>
                        <!-- RADAR CARDINAL DIRECTION LINES -->
                        <div
                          v-for="(line, index) in radarLines"
                          v-bind:key="'line' + index"
                        >
                          <v-line
                            :config="{ points: line, stroke: '#1EEF56' }"
                          /></div
                      ></v-layer>
                      <!-- ITEMS ON RADAR -->
                      <v-layer>
                        <div
                          v-for="(circle, index) in filteredItems"
                          v-bind:key="'points' + index"
                        >
                          <v-circle
                            :config="{
                              x: circle.radarCoordinates[0],
                              y: circle.radarCoordinates[1],
                              radius: 10,
                              fill: circle.fill,
                              stroke: 'white',
                              strokeWidth: 2,
                            }"
                            @mouseover="pointHover(circle, false)"
                            @mouseout="pointHover(null, true)"
                          />
                        </div>
                      </v-layer>
                      <!-- ITEM ON-HOVER MESSAGE -->
                      <!-- TODO: USE V-LABEL INSTEAD OF V-RECT + V-TEXT -->
                      <v-layer>
                        <div v-if="!itemOnHover.hidden">
                          <v-rect :config="itemOnHover.rect" />
                          <v-text :config="itemOnHover.text" />
                        </div>
                      </v-layer>
                    </v-stage>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-col>
          <!-- RADAR LEGEND -->
          <el-col :span="4" align="top" class="gray-bg hidden-md-and-down">
            <div v-if="validLegend.length > 0">
              <!-- TITLE -->
              <h2
                class="grid-title"
                style="margin-top:10px; margin-bottom:10px"
              >
                Legend
              </h2>
              <!-- RADAR LEGENDS -->
              <div
                v-for="(legendKey, index) in legend"
                v-bind:key="'legend' + index"
              >
                <div v-if="validLegend.includes(legendKey.caption)">
                  <v-stage ref="stage" :config="{ height: 40, width: 250 }"
                    ><v-layer
                      ><v-rect
                        :config="{
                          x: 20,
                          y: 10,
                          width: 20,
                          height: 20,
                          fill: legendKey.color,
                          stroke: 'white',
                          strokeWidth: 2,
                        }"/><v-text
                        :text="legendKey.caption"
                        fontFamily="IM Fell DW Pic"
                        :fontSize="20"
                        fontStyle="bold"
                        fill="white"
                        :x="60"
                        :y="12"/></v-layer
                  ></v-stage>
                </div>
              </div>
              <div style="margin-bottom:10px"></div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- DETECTION SETTINGS -->
      <div
        v-if="screenConfig"
        class="grid-content-main gray-bg"
        style="width:70%;margin:auto"
      >
        <!-- TITLE -->
        <el-row
          align="middle"
          type="flex"
          justify="space-around"
          style="margin-top:30px"
          ><el-col
            ><h2 class="grid-title" style="margin-top:30px">
              Detection settings
            </h2></el-col
          ></el-row
        >
        <!-- SETTINGS -->
        <el-row align="middle" type="flex" justify="space-around">
          <!-- DETECTION SETTINGS -->
          <el-col :span="10">
            <!-- SCREENSHOT SIZE SETTINGS -->
            <el-row
              ><el-col>
                <!-- TITLE -->
                <el-row style="margin-top:30px"
                  ><h3>Screenshot settings</h3></el-row
                >
                <el-row type="flex" align="middle" justify="center">
                  <!-- X POSITION -->
                  <el-col :span="10"
                    >X Position:<br /><el-input-number
                      v-model="screenSettings.XPos"
                      size="small"
                      :min="0"
                      :max="2160"
                      :step="1"
                    ></el-input-number
                  ></el-col>
                  <!-- Y POSITION -->
                  <el-col :span="10"
                    >Y Position:<br /><el-input-number
                      v-model="screenSettings.YPos"
                      size="small"
                      :min="0"
                      :max="3840"
                      :step="1"
                    ></el-input-number
                  ></el-col>
                </el-row>
                <el-row type="flex" align="middle" justify="center">
                  <!-- SCREENSHOT WIDTH -->
                  <el-col :span="10"
                    >Screenshot width:<br /><el-input-number
                      v-model="screenSettings.width"
                      size="small"
                      :min="100"
                      :max="600"
                      :step="1"
                    ></el-input-number
                  ></el-col>
                  <!-- SCREENSHOT HEIGHT -->
                  <el-col :span="10"
                    >Screenshot height:<br /><el-input-number
                      v-model="screenSettings.height"
                      size="small"
                      :min="10"
                      :max="300"
                      :step="1"
                    ></el-input-number
                  ></el-col>
                </el-row>
                <!-- OCR SETTINGS -->
                <el-row style="margin-top:30px"><h3>OCR settings</h3></el-row>
                <el-row
                  type="flex"
                  align="middle"
                  justify="center"
                  style="margin-bottom:30px"
                >
                  <!-- OEM SETTING -->
                  <el-col :span="10"
                    >OEM type:<br /><el-select
                      v-model="ocrSettings.oem"
                      size="small"
                      ><el-option
                        v-for="item in oemOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option></el-select
                  ></el-col>
                  <el-col :span="1"></el-col>
                  <!-- PSM SETTING -->
                  <el-col :span="10"
                    >PSM type:<br /><el-select
                      v-model="ocrSettings.psm"
                      size="small"
                      ><el-option
                        v-for="item in psmOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option></el-select
                  ></el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- DETECTION SETTINGS BUTTONS -->
            <el-row
              type="flex"
              align="middle"
              justify="center"
              style="margin-top:30px; margin-bottom:30px"
            >
              <!-- SAVE SETTINGS BUTTON -->
              <el-col :span="7">
                <el-button @click="saveUserSettings()">Save settings</el-button>
              </el-col>
              <!-- APPLY SETTINGS / BACK TO MAIN SCREEN BUTTON -->
              <el-col :span="7">
                <el-button @click="applySettings()">Apply</el-button>
              </el-col>
            </el-row>
          </el-col>
          <!-- DETECTION CHECKER -->
          <el-col :span="12" style="margin-bottom:17px">
            <!-- TITLE -->
            <el-row style="margin-top:30px"
              ><h3>Screenshot detection</h3></el-row
            >
            <!-- SAMPLE SCREENSHOT -->
            <div>
              <el-row style="margin-top:30px">
                <img
                  src="./data/imageCroppedTrue.jpg"
                  style="padding: 4px; background-color: #fff"
                />
              </el-row>
              <el-row>
                Good screenshot sample
              </el-row>
              <el-row>
                Detected location: [ 9520.039, 4542.812, 132.531 ]
              </el-row>
            </div>
            <!-- USER SAMPLE SCREENSHOT -->
            <div>
              <el-row style="margin-top:30px">
                <img
                  :src="updateImage()"
                  style="padding: 4px; background-color: #fff"
                />
              </el-row>
              <el-row>
                Your screenshot
              </el-row>
              <el-row>
                <div v-if="tempPos.length == 3">
                  Detected location: {{ tempPos }}
                </div>
                <div v-else>
                  Detected location: [ NOT FOUND ]
                </div>
              </el-row>
            </div>
            <!-- TEST DETECTION BUTTON -->
            <el-row style="margin-top:30px">
              <el-button @click="getScreenshot()">Test detection</el-button>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
// There's some things that vue.js cannot do, so we need to request using and API (with node.js)
import axios from "axios";
// Importing Element-UI responsive design things
import "element-ui/lib/theme-chalk/display.css";

export default {
  data() {
    return {
      // TRACKING SETTINGS
      stageSize: 570,
      distance: 500,
      amount: 20,
      // ITEMS
      allItems: null,
      validItems: null,
      filteredItems: [],
      itemKeys: [],
      itemSubkeys: [],
      itemCascate: [],
      chosenKeys: [],
      // LOCATION
      currentPos: [],
      tempPos: [],
      locationMessage: null,
      locationErrorMessage: null,
      // RADAR
      radar: [],
      radarLines: [],
      itemOnHover: {},
      typesByColors: {
        areas: "#4c2b1f",
        chests: "#f29b61",
        documents: "#807153",
        essences: "#f5ff66",
        fishing: "#61f2ae",
        monsters: "#636b99",
        npc: "#6666ff",
        ores: "#8c3887",
        plants: "#ffa6e1",
        pois: "#bf4d5c",
        woods: "#4d4d4d",
      },
      openRadar: true,
      // AUTO RADAR
      radarFrequency: 1,
      radarOn: false,
      // LEGEND
      legend: [
        { caption: "Areas", color: "#4c2b1f" },
        { caption: "Chests", color: "#f29b61" },
        { caption: "Documents", color: "#807153" },
        { caption: "Essences", color: "#f5ff66" },
        { caption: "Fishing", color: "#61f2ae" },
        { caption: "Monsters", color: "#636b99" },
        { caption: "Npc", color: "#6666ff" },
        { caption: "Ores", color: "#8c3887" },
        { caption: "Plants", color: "#ffa6e1" },
        { caption: "Pois", color: "#bf4d5c" },
        { caption: "Woods", color: "#4d4d4d" },
      ],
      validLegend: [],
      // DETECTION
      oemOptions: [
        { value: 0, label: "Orientation and script detection (OSD) only." },
        { value: 1, label: "Automatic page segmentation with OSD." },
        {
          value: 2,
          label:
            "Automatic page segmentation, but no OSD, or OCR. (not implemented)",
        },
        {
          value: 3,
          label: "[RECOMMENDED] Fully automatic page segmentation, but no OSD.",
        },
        {
          value: 4,
          label: "Assume a single column of text of variable sizes.",
        },
        {
          value: 5,
          label: "Assume a single uniform block of vertically aligned text.",
        },
        { value: 6, label: "Assume a single uniform block of text." },
        { value: 7, label: "Treat the image as a single text line." },
        { value: 8, label: "Treat the image as a single word." },
        { value: 9, label: "Treat the image as a single word in a circle." },
        { value: 10, label: "Treat the image as a single character." },
        {
          value: 11,
          label:
            "Sparse text. Find as much text as possible in no particular order.",
        },
        { value: 12, label: "Orientation and script detection (OSD) only." },
        {
          value: 13,
          label:
            "Raw line. Treat the image as a single text line, bypassing hacks that are Tesseract-specific.",
        },
      ],
      psmOptions: [
        { value: 0, label: "Original Tesseract only." },
        { value: 1, label: "Neural nets LSTM only." },
        { value: 2, label: "Tesseract + LSTM." },
        { value: 3, label: "[RECOMMENDED] Based on what is available." },
      ],
      imageURL: "./data/imageCropped.jpg",
      // SETTINGS & LOADINGS
      mainLoading: true,
      mainScreen: true,
      loadingRadar: true,
      screenConfig: false,
      screenSettings: {},
      ocrSettings: {},
      userSettings: {},
    };
  },
  async created() {
    var self = this;
    self.onResize({
      currentTarget: { innerWidth: window.innerWidth },
    });
    window.addEventListener("resize", self.onResize);
    self.radarStructure(false, false, false);
    await self.getUserSettings();
    var loadingPromises = [];
    loadingPromises.push(self.getAllItems());
    loadingPromises.push(self.getScreenshot());
    await Promise.all(loadingPromises);
    self.mainLoading = false;
  },
  methods: {
    // SCREENSHOTS
    updateImage() {
      var self = this;
      // most reliable/fast way to update image in vue.js is by reading the data buffer
      return "data:image/jpg;base64," + self.imageURL;
    },
    async getScreenshot() {
      var self = this;
      var screenGetParams =
        `xpos=${self.screenSettings.XPos}&` +
        `ypos=${self.screenSettings.YPos}&` +
        `width=${self.screenSettings.width}&` +
        `height=${self.screenSettings.height}`;
      // vue.js can't take screenshot out of the browser, so we need to use an API
      self.imageURL = (
        await axios.get(`http://localhost:1011/screenshot?${screenGetParams}`)
      ).data;
      var ocrParams =
        `oem=${self.ocrSettings.oem}&` + `psm=${self.ocrSettings.psm}`;
      // vue.js can't properly run OCR, so we need to use an API
      self.tempPos =
        (await axios.get(`http://localhost:1011/ocr?${ocrParams}`)).data || [];
      if (self.tempPos.length == 3) self.currentPos = self.tempPos;
      else self.tempPos = [];
      self.updateImage();
      return;
    },

    // RADAR
    radarStructure(validate = true, errorMsg = true, screenshot = true) {
      // RADAR CONSTRUCTOR
      var self = this;
      self.loadingRadar = true;
      self.radar = [];
      self.radarLines = [];
      for (var i = 0; i <= 5; i++) self.radar.push((self.stageSize / 10) * i);
      var x, y;
      for (i = 0; i <= 3; i++) {
        x = Math.sin((i * Math.PI) / 4);
        y = Math.cos((i * Math.PI) / 4);
        self.radarLines.push([
          Math.round(self.stageSize / 2 - (self.stageSize * x) / 2),
          Math.round(self.stageSize / 2 - (self.stageSize * y) / 2),
          Math.round(
            self.stageSize - (self.stageSize / 2 - (self.stageSize * x) / 2)
          ),
          Math.round(
            self.stageSize - (self.stageSize / 2 - (self.stageSize * y) / 2)
          ),
        ]);
      }
      if (self.filteredItems.length > 0 || validate)
        self.updateItems(validate, errorMsg, screenshot);
      self.loadingRadar = false;
    },
    pointHover(properties, hide) {
      // LABEL CONTENT WHEN HOVERING ITEMS ON RADAR
      // TODO use v-label instead of v-rect + v-tex
      // this is really confusing, TODO redo this function
      var self = this;
      if (hide) self.itemOnHover.hidden = true;
      else {
        var width, height;
        var offset = [0, 0];
        if (properties.radarCoordinates[0] + 310 < self.stageSize) {
          width = 280;
          offset[0] = 10;
        } else {
          width = -280;
          offset[0] = -10;
        }
        if (properties.radarCoordinates[1] < 110) {
          height = 90;
          offset[1] = 10;
        } else {
          height = -90;
          offset[1] = -10;
        }
        var rect = {
          x: properties.radarCoordinates[0] + offset[0],
          y: properties.radarCoordinates[1] + offset[1],
          width: width,
          height: height,
          fill: self.typesByColors[properties.type],
          stroke: "white",
        };
        var type_ =
          properties.type.charAt(0).toUpperCase() + properties.type.slice(1);
        var name_ = (
          properties.name.charAt(0).toUpperCase() + properties.name.slice(1)
        ).replace(/_/g, " ");
        var coordinates_ = `[${properties.realCoordinates[0]}, ${properties.realCoordinates[1]}]`;
        var text = {
          fontFamily: "Calibri",
          fontSize: 18,
          fontStyle: "bold",
          fill: "black",
          text: `Type: ${type_}\nName: ${name_}\n\nCoordinates: ${coordinates_}`,
        };
        if (width > 0) {
          text.x = properties.radarCoordinates[0] + offset[0] * 2;
          text.width = width;
        } else {
          text.x = properties.radarCoordinates[0] + width;
          text.width = -width - 20;
        }
        if (height > 0) {
          text.y = properties.radarCoordinates[1] + offset[1] * 2;
          text.height = height;
        } else {
          text.y = properties.radarCoordinates[1] - Math.abs(height);
          text.height = -height;
        }
        var itemOnHover = {
          rect: rect,
          text: text,
          hidden: false,
        };
        self.itemOnHover = itemOnHover;
      }
    },
    async radarProcess() {
      // AUTO RADAR PROCESS
      var self = this;
      var lastSuccess, timePromises;
      // If switch is off then it changes self.radarOn to false and stops the process
      while (self.radarOn) {
        timePromises = [];
        timePromises.push(
          new Promise((resolve) =>
            setTimeout(resolve, self.radarFrequency * 1000)
          )
        );
        timePromises.push(self.updateItems(true, false));
        await Promise.all(timePromises);
        if (self.currentPos.length != 3)
          self.locationErrorMessage = "Couldn't detect your location.";
        else {
          self.locationMessage = `Location: ${self.currentPos}`;
          if (self.tempPos.length == 3) {
            self.locationErrorMessage = null;
            lastSuccess = new Date();
          } else {
            self.locationErrorMessage = `Location not found.\nUsing location from ${(
              (new Date() - lastSuccess) /
              1000
            ).toFixed(1)}s ago.`;
          }
        }
      }
      // Clean things
      if (!self.radarOn) {
        self.locationMessage = null;
        self.locationErrorMessage = null;
        self.currentPos = [];
        self.filteredItems = [];
      }
    },
    onResize(event) {
      // Radar resize when changing screen size
      // Element io responsive can't change automatically change radar structure, we need to do it (kinda) manually
      var self = this;
      var width = event.currentTarget.innerWidth;
      if (width < 768) self.stageSize = (width * 20) / 24 - 70;
      else if (width < 992) self.stageSize = (width * 14) / 24 - 70;
      else self.stageSize = width / 2 - 70;
      if (self.stageSize >= 1080) self.stageSize = 1080;
      self.radarStructure(false, false, false);
    },

    // ITEMS
    async updateItems(validate = true, errorMsg = true, screenshot = true) {
      // TODO redo all item functions to do something that doesn't need the params above
      // This function just update the items on screen,
      // it won't screenshot and/or process the items unless it is asked to do so (validate = true, screenshot = true)
      var self = this;
      if (screenshot) await self.getScreenshot();
      if (validate || !self.validItems) await self.validateItems(errorMsg);
      self.filteredItems = [];
      var radarCoordinates, resizer;
      if (self.validItems && self.validItems.length > 0) {
        if (self.validItems.length >= self.amount)
          resizer = self.validItems[self.amount].distance;
        else resizer = self.validItems[self.validItems.length - 1].distance;
        resizer = self.stageSize / 2 / resizer;
        var legend = [];
        for (var [index, item] of self.validItems.entries()) {
          if (index == self.amount) break;
          radarCoordinates = [
            (item.realCoordinates[0] - self.currentPos[0]) * resizer +
              self.stageSize / 2,
            (item.realCoordinates[1] - self.currentPos[1]) * resizer +
              self.stageSize / 2,
          ];
          item.radarCoordinates = radarCoordinates;
          item.fill = self.typesByColors[item.type];
          self.filteredItems.push(item);
          if (!legend.includes(item.type)) {
            legend.push(item.type);
          }
        }
        self.validLegend = [];
        for (var legendKey of legend)
          self.validLegend.push(
            legendKey.charAt(0).toUpperCase() + legendKey.slice(1)
          );
      } else self.validLegend = [];
    },
    async validateItems(errorMsg = true) {
      // this is the function that does all the math to get the desired items
      var self = this;
      if (!self.allItems) await self.getAllItems();
      if (self.currentPos.length != 3) {
        if (errorMsg) self.error("Invalid coordinates");
        return;
      } else {
        if (self.chosenKeys.length == 0) {
          self.chosenKeys = [];
          for (var key__ of self.itemSubkeys)
            self.chosenKeys.push([null, key__]);
        }
        self.validItems = [];
        for (var key of self.chosenKeys) {
          if (typeof key == "string") continue;
          key = key[1];
          key = key.split("&&");
          var items = self.allItems[key[0]][key[1]] || [];
          for (var item of items) {
            if (item.x && item.y) {
              var distance = Math.sqrt(
                (item.x - self.currentPos[0]) ** 2 +
                  (item.y - self.currentPos[1]) ** 2
              );
              if (distance < self.distance)
                self.validItems.push({
                  realCoordinates: [item.x, item.y],
                  distance: distance,
                  type: key[0],
                  name: key[1],
                });
            }
          }
        }
        self.validItems.sort(function(a, b) {
          return a.distance - b.distance;
        });
        return;
      }
    },
    async getAllItems() {
      // function that reads all items on database, usually it will only run once
      var self = this;
      // file processing using node.js server
      self.allItems =
        (await axios.get("http://localhost:1011/files")).data || {};
      self.itemKeys = Object.keys(self.allItems);
      self.itemSubkeys = [];
      var itemCascate = [];
      var cascateChildren, key_;
      for (var key of self.itemKeys) {
        cascateChildren = [];
        for (var subkey of Object.keys(self.allItems[key])) {
          key_ = `${key}&&${subkey}`;
          subkey = (subkey.charAt(0).toUpperCase() + subkey.slice(1)).replace(
            /_/g,
            " "
          );
          self.itemSubkeys.push(key_);
          cascateChildren.push({
            value: key_,
            label: subkey,
          });
        }
        key = key.charAt(0).toUpperCase() + key.slice(1);
        itemCascate.push({
          label: key,
          children: cascateChildren,
        });
      }
      self.itemCascate = itemCascate;
      return;
    },

    // SETTINGS & ERRORS
    applySettings() {
      // just changes view back to main screen
      var self = this;
      self.screenConfig = false;
      self.mainScreen = true;
      self.success("Settings were applied successfully.");
      return;
    },
    openscreenConfig() {
      // opens settings screen
      var self = this;
      self.mainScreen = false;
      self.screenConfig = true;
      self.getScreenshot();
    },
    async saveUserSettings() {
      // save user settings (using node.js server)
      var self = this;
      var updateQuery =
        `SCREENSHOTX=${self.screenSettings.XPos}&` +
        `SCREENSHOTY=${self.screenSettings.YPos}&` +
        `SCREENSHOTWIDTH=${self.screenSettings.width}&` +
        `SCREENSHOTHEIGHT=${self.screenSettings.height}&` +
        `OEM=${self.ocrSettings.oem}&` +
        `PSM=${self.ocrSettings.psm}`;
      await axios.get(`http://localhost:1011/settings?${updateQuery}`);
      self.success("Settings were saved successfully.");
      return;
    },
    async getUserSettings() {
      // read user settings (using node.js server)
      var self = this;
      self.userSettings =
        (await axios.get("http://localhost:1011/settings")).data || {};
      self.screenSettings = {
        XPos: self.userSettings.SCREENSHOTX || 1570,
        YPos: self.userSettings.SCREENSHOTY || 0,
        width: self.userSettings.SCREENSHOTWIDTH || 350,
        height: self.userSettings.SCREENSHOTHEIGHT || 40,
      };
      self.ocrSettings = {
        oem: parseInt(self.userSettings.OEM) || 3,
        psm: parseInt(self.userSettings.PSM) || 3,
      };
      return;
    },
    success(message) {
      // shows a success message
      this.$message.success(message);
    },
    error(message) {
      // shows an error message
      this.$message.error(message);
    },
  },
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.el-row {
  margin-bottom: 10px;
  border-radius: 20px;
}
.el-row:first-child {
  margin-top: 10px;
}
.el-row:last-child {
  margin-bottom: 10px;
}
.el-col {
  font-weight: bold;
  border-radius: 20px;
}
.gray-bg {
  background: #292929;
}
.grid-content {
  border-radius: 4px;
  min-height: 40px;
}
.grid-content-main {
  border-radius: 20px;
  min-height: 40px;
}
.grid-title {
  vertical-align: middle;
  color: white;
  font-size: 40px;
  font-weight: bold;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
