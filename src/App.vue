<script setup>
import { ref,onMounted,watchEffect } from 'vue'
import * as echarts from 'echarts'
import { ElSelect } from 'element-plus'
import city from "./assets/city.json";  //城市名称搜索数据
import dep from "./assets/dep.json";  //省份名称搜索数据
import dep5gop from "./assets/dep5gop.json";  //省份5G数据
/*省份5G数据 {
  "li":[{
    "name":"省份名称",
    "value":"运营商数量",
    "nom_operateur": {"Free Mobile": 129, "Bouygues Telecom": 16, "SFR": 8}
    },...],
  "map": {"Ain": 0,...}
}
*/
import city5gop from "./assets/city5gop.json"; //城市5G数据
import op5gdep from "./assets/op5gdep.json";  //省份运营商数据
/*省份运营商数据{
  "Bouygues Telecom":["Loire",...],
  "Orange":["..",...],
  "Free":["..",...],
  "SFR":["..",...]
}
*/
import op5gcity from "./assets/op5gcity.json"; //城市运营商数据
import CityGeoJson from "./assets/arrondissements.json";  //城市地图数据
import DepartementsGeoJson from "./assets/departements.json";  //省份地图数据

let myChart,option;

let mapType = ref('FranceDep') //地图变量，以及初始值，初始展示省份数据
let mapData = ref(dep5gop['li']); //地图数据
let mapDataMap = ref(dep5gop['map']); //地图数据的索引（为了加快选中时查找性能）
let searchData = ref(dep); //搜索数据
let opData = ref(op5gdep); //运营商数据
const Config = [ //Config[0]是城市的数据，Config[1]是省份的数据
  [
    'France',
    city5gop['li'],
    city5gop['map'],
    city,
    op5gcity
  ],[
    'FranceDep',
    dep5gop['li'],
    dep5gop['map'],
    dep,
    op5gdep
  ]
]
let search_tr = ref(false);//搜索侧边栏状态//初始false表示初始侧边栏收起来
function trigger(){ search_tr.value = !search_tr.value;} //搜索侧边栏状态切换函数
let selected = ref({}); //选中的城市/省份，用于右侧大的悬浮展示框展示信息
let OPselected = ref(''); //选中的要展示的运营商，用于左侧栏分运营商展示
let switched = ref(true); //城市和省份切换
function switchd(){ //城市和省份切换函数
  myChart.showLoading()
  switched.value = !switched.value;
  [
    mapType.value, 
    mapData.value,
    mapDataMap.value,
    searchData.value,
    opData.value
  ] = Config[switched.value ? 1 : 0]; //Config[0]是城市的数据，Config[1]是省份的数据
  myChart.setOption({  //调用Echarts函数来切换数据以及地图
    series: [{
      map: mapType.value,
      data:mapData.value
    }]
  })
  myChart.hideLoading()
}

const shoptions = ref([]) //搜索需要的一些变量
const shvalue = ref('')  //搜索框输入的城市/省份
const loading = ref(false)  //加载状态变量
  
const remoteMethod = async (query) => {  //搜索的加载方法
  if (query !== '') {
  shoptions.value = searchData.value.filter((item) => {
    return item.toLowerCase().indexOf(query.toLowerCase()) > -1
  })

  } else {
    shoptions.value = [];
  }
}

let piePatternSrc = 'data:image/png;base64,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'
let piePatternImg = new Image();
piePatternImg.src = piePatternSrc;
// onMounted表示在Dom挂载后调用的回调函数，echarts的初始化必须在这里
onMounted(async () => {
  myChart = echarts.init(document.getElementById('map'));
  myChart.showLoading();
  echarts.registerMap('France', CityGeoJson); //注册城市地图
  echarts.registerMap('FranceDep', DepartementsGeoJson); //注册省地图
  myChart.setOption(
    (option = {
      tooltip: {  //鼠标悬停展示框（小的那个）
        trigger: 'item',
        transitionDuration: 0.2,
        formatter: function (params) {
          return `${params.name}<br/> Nombre d\'opérateurs 5G: <strong>${params.value ? params.value : 0}</strong>`;
        }
      },
      visualMap: {
        min: 0, //value最小值
        max: 4, //value最大值
        // text:["nombre d'opérateurs de 5G"],
        realtime: false,
        calculable: true,
        inRange: {
          color: ['#b0c7e0','#77a0e0','#105cd6'] //颜色渐变
        }
      },
      series: [{
          selectedMode:'multiple', // 可以多选
          name: 'France5G',
          type: 'map',
          map: mapType.value,
          zoom: 1.2, //地图初始缩放倍数
        scaleLimit: {
          max: 6, //限制地图最大缩放
          min: 1.2 //限制地图最小缩放
        },
        nameProperty: 'nom', //对应geojson中城市名字的字段 ”nom“
        label: {
          show: false
        },
        labelLayout:{
          hideOverlap:true
        },
        itemStyle:{
          // borderWidth:0   //borderWidth为0表示不显示轮廓，这里显示轮廓，所以注释掉
        },
        emphasis: { //地图块鼠标悬停的样式
          label: {
            show: true
          },
          itemStyle:{
            areaColor:'#1fb6e4'
          }
        },
        select:{ //地图块选中的样式
          itemStyle:{
            // areaColor:'#f8647d',
            areaColor:{
              image: piePatternImg,
              repeat: 'repeat'
            }
          },
          label: {
            show: false
          },
      },
        roam: true,
        data: mapData.value  //地图的Data
      }]
    })
  );

  option && myChart.setOption(option);
  myChart.on('mouseover', function (params) {
    selected.value = params;
  });
  myChart.on('mouseout', function (params) {
    selected.value = '';
  });
  myChart.on('click',()=>{ 
    myChart.dispatchAction({
    type: 'unselect',
    seriesIndex: 0,
    name: shvalue.value
    })
    shvalue.value = ''
  }) //鼠标手动选择时，将搜索框选择清空

  watchEffect(()=>{
  let s = OPselected.value;
  if (s == '') {  //如果当前选中的运营商为空，则将地图上的块全部取消选择
    myChart.dispatchAction({
    type: 'unselect',
    seriesIndex: 0,
    name: searchData.value
  })
  }
  else{
    myChart.dispatchAction({
    type: 'unselect',
    seriesIndex: 0,
    name: searchData.value
  }) //先将地图上的块全部取消选择
    myChart.dispatchAction({
    type: 'select',
    seriesIndex: 0,
    name: opData.value[s]
    }); //再选择这个运营商包含的区域
  }
  });
  watchEffect(()=>{  //搜索框选择的逻辑同上
  let s = shvalue.value;
  if (s == '') {
    selected.value = null
    myChart.dispatchAction({
    type: 'unselect',
    seriesIndex: 0,
    name: searchData.value
  })
  }
  else{
    let t = mapData.value[mapDataMap.value[s]];
    selected.value =  {name:t.name,data:t};
    myChart.dispatchAction({
    type: 'unselect',
    seriesIndex: 0,
    name: searchData.value
  })
    myChart.dispatchAction({
    type: 'select',
    seriesIndex: 0,
    name: s
    });
  }
  });
  myChart.hideLoading();

})

</script>

<template>
  <div id="app">
    <span id="tx">"nombre d'opérateurs de 5G"</span>
    <div class="top">
      <h2>Répartition des opérateurs 5G en France</h2>
    </div>
    <!-- 地图 -->
    <div id="map"></div> 
    <!-- 右侧悬浮框 -->
    <div v-show="selected"  class="con">
      Informations réseau
      <br/>
        <span v-if="selected">
        {{selected ? selected.name : ''}} 
        {{ selected.data && selected.data.code_commune_insee ? '- ' + selected.data.code_commune_insee : ''}}
      </span>
      <br/>
      <div style="font-size: 0.8em;margin-top: 0.5em">
      Opérateurs 5G
      </div>
      <div v-if="selected && selected.data">
          <div class="op5g" v-show="selected.data.nom_operateur.hasOwnProperty('Orange')" ><img class="logo" src="./assets/orange.png" alt=""> <span>Orange <span class='hinum'>{{selected.data.nom_operateur['Orange']}}</span></span></div>
          <div class="op5g" v-show="selected.data.nom_operateur.hasOwnProperty('SFR')"  ><img class="logo" src="./assets/sfr.png" alt=""> <span>SFR <span class='hinum'>{{selected.data.nom_operateur['SFR']}}</span></span></div>
          <div class="op5g" v-show="selected.data.nom_operateur.hasOwnProperty('Bouygues Telecom')"><img class="logo" src="./assets/bouygues-telecom.png" alt=""> <span>Bouygues Telecom <span class='hinum'>{{selected.data.nom_operateur['Bouygues Telecom']}}</span></span> </div>
          <div class="op5g" v-show="selected.data.nom_operateur.hasOwnProperty('Free Mobile')"><img class="logo" src="./assets/free.png" alt=""> <span>Free Mobile <span class='hinum'>{{selected.data.nom_operateur['Free Mobile']}}</span></span> </div>
      </div>
    </div>
    <!-- 搜索框 -->
    <div class="bar" :class="{tran:search_tr}">
      <div class="select">
        <el-select
          v-model="shvalue"
          filterable
          remote
          reserve-keyword
          placeholder="Chercher"
          no-data-text="aucun résultat"
          :remote-method="remoteMethod"
          :loading="loading">
          <el-option
            v-for="item in shoptions"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </div>
    </div>
    <!-- 按钮组 -->
    <div class="icons">
      <div class="search_tr" @click="trigger()" ><div class="icon" :class="{tran:search_tr}" @click="search_tr == !search_tr"></div> </div> 
      <div class="switch" @click="switchd()" ><div class="icon" :class="{tran:switched}" @click="switched == !switched"></div> </div> 
      <div class="op5gc" ><img @click="OPselected = OPselected == 'Orange' ? '' : 'Orange'" :class="{ mark:OPselected == 'Orange' }" class="logo orange" src="./assets/orange.png" alt=""> <a v-show="search_tr" href="https://www.orange.com/">Orange</a></div>
      <div class="op5gc" ><img @click="OPselected = OPselected == 'SFR' ? '' : 'SFR'" :class="{ mark:OPselected == 'SFR' }" class="logo sfr" src="./assets/sfr.png" alt=""> <a v-show="search_tr" href="https://www.sfr.fr">SFR</a></div>
      <div class="op5gc" ><img @click="OPselected = OPselected == 'Bouygues Telecom' ? '' : 'Bouygues Telecom'" :class="{ mark:OPselected == 'Bouygues Telecom' }" class="logo bt" src="./assets/bouygues-telecom.png" alt=""> <a v-show="search_tr" href="https://www.bouyguestelecom.fr">Bouygues Telecom</a></div>
      <div class="op5gc" ><img @click="OPselected = OPselected == 'Free Mobile' ? '' : 'Free Mobile'" :class="{ mark:OPselected == 'Free Mobile' }" class="logo free" src="./assets/free.png" alt=""> <a v-show="search_tr" href="https://mobile.free.fr/reseau-5G.html">Free Mobile</a></div>
    </div>
  </div>
</template>

<style>
:root{
  --bodyblue:#d6e4f1;
  --backblue:#e3e8f0;
  --blue1:#b0c7e0;
  --blue2:#77a0e0;
  --blue3:#105cd6;
  --blue4:#1fb6e4;
}
body {
  margin: 0;
  padding: 0;
  background-color: var(--bodyblue);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e5086;
  margin: 0 0;
  background-color: var(--bodyblue);
}
#map {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
}
.con {
  position: fixed;
  top: 10vh;
  right: 0;
  width: 25vw;
  min-height: 10em;
  background-color: var(--backblue);
  color: #757575;
  box-shadow: 0px 5px 10px #666666;
  border-radius: 0.7em;
  text-align: left;
  padding: 1em;
  transition: all 1s ease 0.2s;
}

h2 {
  color: white;
  margin: 0;
}
.con{
  font-size: 1.1em;
}
.top{
  position: fixed;
  top: 0;
  left: 0;
  height: 3em;
  line-height: 3em;
  box-shadow: 0px 3px 10px #666666;
  background-color: #5c7aa8;
  z-index: 100;
  border-radius: 0em 1.5em 1.5em 0em;
  margin-bottom: 0.7em;
  text-align: center;
  padding: 0em 2em;
}
.logo{
  width: 2em;
  height: 2em;
  /* margin: 0.2em; */
  vertical-align:middle;
}
.op5g{
  height: 1.5em;
  padding: 0.3em;
  line-height: 1.5em;
  margin: 0.5em 0;
}
.op5g span{
  margin-left: 0.5em;
  font-size: 0.8em;
  font-weight: bolder;
  line-height: 1.5em;
}
.bar{
  font-size: 1.2em;
  padding: 0em 0.5em 0.5em 0.5em;
  width: 2em;
  height: 16.5em;
  position: fixed;
  left: 0;
  top: 20vh;
  background-color: var(--backblue);
  border-radius: 0em 0.5em 0.5em 0em;
  box-shadow: 0px 3px 8px #666666;
  transition: all .25s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  overflow: hidden;
}
.op5gc{
  margin-top: 0.5em;
}
.icons .logo{
  border-radius: 0.3em;
  opacity: 0.6;
  vertical-align:middle;
}
.icons .search_tr{
  position: relative;
  top: -2em;
  vertical-align:middle;
  background-color: #407dc4;
  border-radius: 50%;
  width: 2em;
}
.search_tr .icon{
  width: 2em;
  height: 2em;
  background: url(data:image/png;base64,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);
  background-position:center center;
  background-size: 75%;
  background-repeat: no-repeat;
  transition: all .25s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  transform: rotate(0deg);
}
.search_tr .icon.tran{
  transform: rotate(-90deg);
}
.search_tr:hover{
  box-shadow: 0px 1px 5px #666666;
}

.icons .switch{
  position: relative;
  top: -1.5em;
  vertical-align:middle;
  background-color: #51a8c2;
  border-radius: 50%;
  width: 2em;
}
.switch .icon{
  width: 2em;
  height: 2em;
  background: url(data:image/png;base64,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);
  background-position:center center;
  background-size: 75%;
  background-repeat: no-repeat;
  transition: all .25s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  transform: scale(0.5);
}
.switch .icon.tran{
  transform: scale(0.9);
}
.switch:hover{
  box-shadow: 0px 1px 5px #666666;
}

.icons .logo:hover{
  box-shadow: 0px 1px 5px #666666;
}
.icons{
  text-align: left;
  font-size: 1.2em;
  padding: 0em 0.5em 0.5em 0.5em;
  position: fixed;
  left: 0;
  top: 20vh;
  margin-top: 2.5em;
}
.icons a{
  color: #666666;
  text-decoration: none;
  margin-left: 1em;
  font-size: 0.8em;
  font-weight: bolder;
  line-height: 1.5em;
}
.icon a:visited{
 color: #407dc4;
}
.icons a:hover{
 cursor:pointer;
 color: #407dc4;
}
.bar.tran{
  width: 15em!important;
  height: 20em!important;
}
.mark{
  opacity: 1!important;
}

.select{
  margin: 0.5em 0 0 3em;
}

.slide-fade-enter-active {
  transition: all .05s ease;
}
.slide-fade-leave-active {
  transition: all .05s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter,
.slide-fade-leave-to{
  width: 0;
  opacity: 0;
}

.hinum
{
  color: #105cd6;
}
#tx{
  position: fixed;
  bottom: 0;
  left: 3em;
  font-size: 125%;
  color: #00000099;
}
</style>
