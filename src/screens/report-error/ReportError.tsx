import I18n from 'i18n-js';
import { Button, Form, Icon, Item, Spinner } from 'native-base';
import React from 'react';
import { KeyboardAvoidingView, ScrollView, Text, TextInput } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { DrawerActions } from 'react-navigation-drawer';
import ChargingStation, { Connector } from 'types/ChargingStation';

import HeaderComponent from './../../components/header/HeaderComponent';
import commonColor from '../../theme/variables/commonColor';
import BaseProps from '../../types/BaseProps';
import Constants from '../../utils/Constants';
import Message from '../../utils/Message';
import Utils from '../../utils/Utils';
import BaseAutoRefreshScreen from '../base-screen/BaseAutoRefreshScreen';
import computeStyleSheet from './ReportErrorStyles';

export interface Props extends BaseProps {
}

interface State {
  loading?: boolean;
  charger?: ChargingStation;
  phone?: string;
  title?: string;
  description?: string;
  connector?: Connector;
  visible?: boolean;
  errorPhone?: object[];
  errorTitle?: object[];
  errorDescription?: object[];
}

export default class ReportError extends BaseAutoRefreshScreen<Props, State> {
  public state: State;
  public props: Props;
  private formValidation = {
    phone: {
      presence: {
        allowEmpty: false,
        message: '^' + I18n.t('authentication.mandatoryPhone')
      }
    },
    title: {
      presence: {
        allowEmpty: false,
        message: '^' + I18n.t('authentication.mandatoryErrorTitle')
      }
    },
    description: {
      presence: {
        allowEmpty: false,
        message: '^' + I18n.t('authentication.mandatoryErrorDescription')
      }
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      email: Utils.getParamFromNavigation(this.props.navigation, 'email', '')
  };
};

  public setState = (state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>, callback?: () => void) => {
    super.setState(state, callback);
  };

  // tslint:disable-next-line: cyclomatic-complexity
  public refresh = async () => {
    // Component Mounted?
    if (this.isMounted()) {
      const chargerID = Utils.getParamFromNavigation(this.props.navigation, 'chargerID', null);
      const connectorID = Utils.getParamFromNavigation(this.props.navigation, 'connectorID', null);
      let charger = null;
      let connector = null;
      if (chargerID) {
        // Get Charger
        charger = await this.getCharger(chargerID);
        if (charger) {
          connector = charger ? charger.connectors[parseInt(connectorID, 10) - 1] : null;
        }
      }
      const securityProvider = this.centralServerProvider.getSecurityProvider();
      // Set
      this.setState({
        loading: false,
        charger: !this.state.charger ? charger : this.state.charger,
        connector,
        isAdmin: securityProvider ? securityProvider.isAdmin() : false,
        isSiteAdmin: securityProvider && charger && charger.siteArea ? securityProvider.isSiteAdmin(charger.siteArea.siteID) : false,
      });
    }
  };

  public getCharger = async (chargerID: string): Promise<ChargingStation> => {
    try {
      // Get Charger
      const charger = await this.centralServerProvider.getCharger({ ID: chargerID });
      return charger;
    } catch (error) {
      // Other common Error
      Utils.handleHttpUnexpectedError(this.centralServerProvider, error,
        'chargers.chargerUnexpectedError', this.props.navigation, this.refresh);
    }
    return null;
  };

  public sendErrorReport = async () => {
    // Check field
    const formIsValid = Utils.validateInput(this, this.formValidation);
    if (formIsValid) {
      const { title, description, phone } = this.state;
      try {
        this.setState({ loading: true } as State);
        // Submit
        await this.centralServerProvider.sendErrorReport(title, description, phone);
        this.setState({ loading: false });
        // Show
        Message.showSuccess(I18n.t('authentication.sendSuccess'));
        this.clearInput();
      } catch (error){
        // submit failed
        this.setState({loading: false});
        // Check request?
        if(error.request) {
          // Show error
          switch(error.request.status) {
            // Unknown Email
            case 550:
              Message.showError(I18n.t('authentication.wrongEmail'));
              break;
            default:
              // Other common Error
              Utils.handleHttpUnexpectedError(this.centralServerProvider, error,
                'authentication.unexpectedError');
          }
        } else{
          Message.showError(I18n.t('authentication.unexpectedError'));
        }
      }
    }
  };

  public clearInput = () => {
    this.setState({
      phone: '' ,
      title: '',
      description: '',
      errorDescription: [],
      errorTitle: [],
      errorPhone: []
    });
  };

  public onBack = () => {
    // Back mobile button: Force navigation
    this.props.navigation.goBack(null);
    // Do not bubble up
    return true;
  };

  public render() {
    const { navigation } = this.props;
    const style = computeStyleSheet();
    const { connector, charger, loading } = this.state;
    const connectorLetter = Utils.getConnectorLetterFromConnectorID(connector ? connector.connectorId : null);
    return  (
      loading ? (
        <Spinner style={style.spinner} />
      ) : (
        <Animatable.View style={style.container} animation={'fadeIn'} iterationCount={1} duration={Constants.ANIMATION_SHOW_HIDE_MILLIS}>
          <HeaderComponent
            navigation={this.props.navigation}
            title={charger ? charger.id : I18n.t('connector.unknown')}
            subTitle={`(${I18n.t('details.connector')} ${connectorLetter})`}
            leftAction={() => this.onBack()}
            leftActionIcon={'navigate-before'}
            rightAction={() => navigation.dispatch(DrawerActions.openDrawer())}
            rightActionIcon={'menu'}
          />
          <ScrollView contentContainerStyle={style.scrollContainer}>
            <KeyboardAvoidingView style={style.keyboardContainer} behavior='padding'>
              <Form style={style.form}>
                <Item inlineLabel={true} style={style.inputGroup}>
                  <Icon active={true} name='call' style={style.inputIcon} />
                  <TextInput
                    returnKeyType='next'
                    selectionColor={commonColor.inverseTextColor}
                    placeholder={I18n.t('authentication.phone')}
                    placeholderTextColor={commonColor.inputColorPlaceholder}
                    style={style.inputField}
                    autoCapitalize='none'
                    blurOnSubmit={false}
                    autoCorrect={false}
                    keyboardType={'numeric'}
                    secureTextEntry={false}
                    onChangeText={(text) => this.setState({ phone: text })}
                    value={this.state.phone}
                  />
                </Item>
                {this.state.errorPhone &&
                  this.state.errorPhone.map((errorMessage, index) => (
                    <Text style={style.formErrorText} key={index}>
                      {errorMessage}
                    </Text>
                  ))}
                <Item inlineLabel={true} style={style.inputGroup}>
                  <Icon active={true} name='bug' style={style.inputIcon} />
                  <TextInput
                    multiline={true}
                    returnKeyType='next'
                    selectionColor={commonColor.inverseTextColor}
                    placeholder={I18n.t('general.errorTitle')}
                    placeholderTextColor={commonColor.inputColorPlaceholder}
                    style={style.inputField}
                    autoCapitalize='none'
                    blurOnSubmit={false}
                    autoCorrect={false}
                    secureTextEntry={false}
                    onChangeText={(text) => this.setState({ title: text })}
                    value={this.state.title}
                  />
                </Item>
                {this.state.errorTitle &&
                  this.state.errorTitle.map((errorMessage, index) => (
                    <Text style={style.formErrorText} key={index}>
                      {errorMessage}
                    </Text>
                  ))}
                  <Item inlineLabel={true} style={style.inputGroup}>
                  <TextInput
                    multiline={true}
                    returnKeyType='next'
                    selectionColor={commonColor.inverseTextColor}
                    placeholder={I18n.t('general.errorDescription')}
                    placeholderTextColor={commonColor.inputColorPlaceholder}
                    style={style.inputField}
                    autoCapitalize='none'
                    blurOnSubmit={false}
                    autoCorrect={false}
                    secureTextEntry={false}
                    onChangeText={(text) => this.setState({ description: text })}
                    value={this.state.description}
                  />
                </Item>
                {this.state.errorDescription &&
                  this.state.errorDescription.map((errorMessage, index) => (
                    <Text style={style.formErrorText} key={index}>
                      {errorMessage}
                    </Text>
                  ))}
            </Form>
          </KeyboardAvoidingView>
        </ScrollView>
        <Item>
          <Button style={style.button} onPress={() => this.clearInput()} >
            <Text style={style.buttonText}>{I18n.t('general.clear')}</Text>
          </Button>
          <Button style={style.button} onPress={() => this.sendErrorReport()}>
            <Text style={style.buttonText}>{I18n.t('general.send')}</Text>
          </Button>
        </Item>
      </Animatable.View>
    ))
  }
};
