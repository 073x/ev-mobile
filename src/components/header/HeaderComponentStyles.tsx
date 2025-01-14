import deepmerge from 'deepmerge';
import { StyleSheet } from 'react-native';
import ResponsiveStylesSheet from 'react-native-responsive-stylesheet';
import { ScaledSheet, scale } from 'react-native-size-matters';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import Utils from '../../utils/Utils';

export default function computeStyleSheet(): StyleSheet.NamedStyles<any> {
  const commonColor = Utils.getCurrentCommonColor();
  const commonStyles = ScaledSheet.create({
    header: {
      width: '100%',
      paddingHorizontal: '10@s',
      paddingVertical: '4@s',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      margin: 0,
      borderBottomWidth: 0,
      borderTopWidth: 0,
      paddingTop: scale(10) + getStatusBarHeight(),
      backgroundColor: commonColor.containerBgColor,
      elevation: 0
    },
    icon: {
      color: commonColor.textColor,
      fontSize: '30@s'
    },
    homeIcon: {
      fontSize: '30@s'
    },
    leftIconContainer: {
      marginRight: '15@s'
    },
    rightIcon: {
      marginLeft: '13@s'
    },
    modalHeader: {
      paddingTop: '10@s'
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100%'
    },
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      marginLeft: '2.5@s',
      flexWrap: 'wrap',
      alignItems: 'center',
      alignContent: 'stretch',
      justifyContent: 'flex-start',
      height: '100%'
    },
    title: {
      fontSize: '17@s',
      color: commonColor.textColor,
      marginRight: '5@s'
    },
    subTitle: {
      fontSize: '17@s',
      color: commonColor.textColor
    },
    actionsContainer: {
      flexDirection: 'row',
      marginLeft: '10@s'
    }
  });
  const portraitStyles = {};
  const landscapeStyles = {};
  return ResponsiveStylesSheet.createOriented({
    landscape: deepmerge(commonStyles, landscapeStyles) as StyleSheet.NamedStyles<any>,
    portrait: deepmerge(commonStyles, portraitStyles) as StyleSheet.NamedStyles<any>
  });
}
