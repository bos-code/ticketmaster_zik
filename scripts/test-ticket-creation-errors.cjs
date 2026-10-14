const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require(process.cwd() + '/node_modules/typescript');
const state = [];
let cursor = 0;
let shouldFail = true;
const navigations = [];
const node = (type, props, ...children) => ({type, props:{...props, children: children.length ? children : props?.children}});
const react = {useState(initial){const index=cursor++;if(!(index in state))state[index]=typeof initial==='function'?initial():initial;return[state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];},useRef(){return {current:null};},useEffect(){},useMemo:fn=>fn(),createElement:node,Fragment:'Fragment'};
const native = {View:'View',Pressable:'Pressable',ScrollView:'ScrollView',ActivityIndicator:'ActivityIndicator',KeyboardAvoidingView:'KeyboardAvoidingView',Platform:{OS:'web'},StyleSheet:{create:styles=>styles,hairlineWidth:1},Alert:{alert(){throw new Error('Web must show errors without relying on unsupported native Alert');}}};
const moduleValue={exports:{}};
const imports={react,'react/jsx-runtime':{jsx:node,jsxs:node,Fragment:'Fragment'},'react-native':native,'react-native-safe-area-context':{SafeAreaView:'SafeAreaView',useSafeAreaInsets:()=>({bottom:0})},'@/components/ui/app-text':{Text:'Text',TextInput:'TextInput'},'@expo/vector-icons':{Ionicons:'Ionicons'},'expo-image':{Image:'Image'},'expo-router':{useRouter:()=>({canGoBack:()=>false,replace:value=>navigations.push(value)}),useLocalSearchParams:()=>({})},'expo-router/head':'Head','expo-status-bar':{StatusBar:'StatusBar'},'@/components/admin/admin-date-time-field':{AdminDateTimeField:'AdminDateTimeField'},'@/components/admin/web-image-cropper':{WebImageCropper:'WebImageCropper'},'@/store/ticketStore':{TICKET_STATUS_OPTIONS:['upcoming','past'],TICKET_TYPE_OPTIONS:['VIP','Standard','General'],useTicketStore:select=>select({tickets:[],addEvent:async()=>{if(shouldFail)throw new Error('Firestore request failed (503)');},updateEvent:async()=>{}})}};
const source=fs.readFileSync('src/components/admin/add-event-admin-screen.tsx','utf8');
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module:moduleValue,exports:moduleValue.exports,require:name=>{if(!(name in imports))throw new Error(name);return imports[name];},console:{warn(){}},setTimeout:()=>0});
function render(){cursor=0;return moduleValue.exports.AddEventAdminScreen();}
function nodes(tree){if(!tree || typeof tree!=='object')return[];return[tree,...[tree.props?.children].flat(Infinity).flatMap(nodes)];}
function saveButton(tree){return nodes(tree).find(item=>item.type==='Pressable'&&nodes(item).some(child=>child.type==='Text'&&child.props?.children==='Create New Ticket'));}
(async()=>{
let tree=render();nodes(tree).find(item=>item.props?.label==='Event Name').props.onChangeText('Preserve my ticket');
tree=render();saveButton(tree).props.onPress();await new Promise(setImmediate);tree=render();
assert(nodes(tree).some(item=>item.props?.accessibilityRole==='alert'),'save failure must be visible');
assert.equal(nodes(tree).find(item=>item.props?.label==='Event Name').props.value,'Preserve my ticket');
assert.equal(saveButton(tree).props.disabled,false,'retry must be available');
assert.equal(navigations.length,0,'failed writes must not report success');
shouldFail=false;saveButton(tree).props.onPress();await new Promise(setImmediate);tree=render();
assert(!nodes(tree).some(item=>item.props?.accessibilityRole==='alert'),'retry clears stale errors');
assert.equal(navigations.length,1,'successful save returns to admin');
nodes(tree).find(item=>item.type==='WebImageCropper').props.onError('Choose another image');tree=render();
assert(nodes(tree).some(item=>item.props?.accessibilityRole==='alert'),'crop failure must also be visible');
console.log('PASS: visible save/crop failures, preserved form, retry, and success navigation.');
})().catch(error=>{console.error(error);process.exit(1);});
