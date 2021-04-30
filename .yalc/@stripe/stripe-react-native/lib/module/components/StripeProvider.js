var _interopRequireWildcard=require("@babel/runtime/helpers/interopRequireWildcard");var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.StripeProvider=StripeProvider;exports.initStripe=void 0;var _defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _react=_interopRequireWildcard(require("react"));var _NativeStripeSdk=_interopRequireDefault(require("../NativeStripeSdk"));var _helpers=require("../helpers");var _package=_interopRequireDefault(require("../../package.json"));function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable;});keys.push.apply(keys,symbols);}return keys;}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){(0,_defineProperty2.default)(target,key,source[key]);});}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source));}else{ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}}return target;}var EXPO_PARTNER_ID='pp_partner_JBN7LkABco2yUu';var appInfo={name:(0,_helpers.shouldAttributeExpo)()?_package.default.name+"/expo":_package.default.name,url:_package.default.repository,version:_package.default.version,partnerId:(0,_helpers.shouldAttributeExpo)()?EXPO_PARTNER_ID:undefined};var initStripe=function initStripe(params){var extendedParams=_objectSpread(_objectSpread({},params),{},{appInfo:appInfo});_NativeStripeSdk.default.initialise(extendedParams);};exports.initStripe=initStripe;function StripeProvider(_ref){var children=_ref.children,publishableKey=_ref.publishableKey,merchantIdentifier=_ref.merchantIdentifier,threeDSecureParams=_ref.threeDSecureParams,stripeAccountId=_ref.stripeAccountId,urlScheme=_ref.urlScheme;(0,_react.useEffect)(function(){if(publishableKey===''){return;}if(_helpers.isAndroid){_NativeStripeSdk.default.initialise({publishableKey:publishableKey,appInfo:appInfo,stripeAccountId:stripeAccountId,threeDSecureParams:threeDSecureParams,urlScheme:urlScheme});}else{_NativeStripeSdk.default.initialise({publishableKey:publishableKey,appInfo:appInfo,stripeAccountId:stripeAccountId,threeDSecureParams:threeDSecureParams,merchantIdentifier:merchantIdentifier,urlScheme:urlScheme});}},[publishableKey,merchantIdentifier,stripeAccountId,threeDSecureParams,urlScheme]);return _react.default.createElement(_react.default.Fragment,null,publishableKey?children:null);}
//# sourceMappingURL=StripeProvider.js.map