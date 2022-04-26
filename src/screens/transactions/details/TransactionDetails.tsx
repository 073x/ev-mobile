import I18n from 'i18n-js';
import moment from 'moment';
import { Container, Icon, Spinner, Text, View } from 'native-base';
import React from 'react';
import { Image, ImageStyle, ScrollView } from 'react-native';

import noSite from '../../../../assets/no-site.png';
import HeaderComponent from '../../../components/header/HeaderComponent';
import UserAvatar from '../../../components/user/avatar/UserAvatar';
import I18nManager from '../../../I18n/I18nManager';
import BaseProps from '../../../types/BaseProps';
import { HTTPError } from '../../../types/HTTPError';
import Transaction from '../../../types/Transaction';
import Constants from '../../../utils/Constants';
import Message from '../../../utils/Message';
import Utils from '../../../utils/Utils';
import BaseScreen from '../../base-screen/BaseScreen';
import computeStyleSheet from './TransactionDetailsStyles';
import { StatusCodes } from 'http-status-codes';

export interface Props extends BaseProps {}

interface State {
  loading?: boolean;
  transaction?: Transaction;
  siteImage?: string;
  elapsedTimeFormatted?: string;
  totalInactivitySecs?: number;
  inactivityFormatted?: string;
  startTransactionNbTrial?: number;
  isPricingActive?: boolean;
  buttonDisabled?: boolean;
  refreshing?: boolean;
  isAdmin?: boolean;
  isSiteAdmin?: boolean;
}

export default class TransactionDetails extends BaseScreen<Props, State> {
  public state: State;
  public props: Props;

  public constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      siteImage: null,
      isAdmin: false,
      isSiteAdmin: false,
      elapsedTimeFormatted: '-',
      totalInactivitySecs: 0,
      inactivityFormatted: '-',
      startTransactionNbTrial: 0,
      isPricingActive: false,
      buttonDisabled: true,
      refreshing: false
    };
  }

  public setState = (
    state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>,
    callback?: () => void
  ) => {
    super.setState(state, callback);
  };

  public async componentDidMount() {
    await super.componentDidMount();
    let siteImage = null;
    // Get IDs
    const transactionID = Utils.getParamFromNavigation(this.props.route, 'transactionID', null) as number;
    // Get Transaction
    const transaction = await this.getTransaction(transactionID);
    // Get the Site Image
    if (transaction && transaction.siteID && this.isMounted()) {
      siteImage = await this.getSiteImage(transaction.siteID);
    }
    // Compute Duration
    this.computeDurationInfos(transaction);
    // Set
    this.setState({
      transaction,
      loading: false,
      siteImage,
      isAdmin: this.securityProvider ? this.securityProvider.isAdmin() : false,
      isSiteAdmin:
        this.securityProvider && transaction && transaction.siteID ? this.securityProvider.isSiteAdmin(transaction.siteID) : false,
      isPricingActive: this.securityProvider?.isComponentPricingActive()
    });
  }

  public getTransaction = async (transactionID: number): Promise<Transaction> => {
    try {
      // Get Transaction
      const transaction = await this.centralServerProvider.getTransaction(transactionID);
      return transaction;
    } catch (error) {
      switch (error.request.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          Message.showError(I18n.t('transactions.transactionDoesNotExist'));
          break;
        default:
          await Utils.handleHttpUnexpectedError(
            this.centralServerProvider,
            error,
            'transactions.transactionUnexpectedError',
            this.props.navigation
          );
      }
    }
    return null;
  };

  public getSiteImage = async (siteID: string): Promise<string> => {
    try {
      const siteImage = await this.centralServerProvider.getSiteImage(siteID);
      return siteImage;
    } catch (error) {
      if (error.request.status !== StatusCodes.NOT_FOUND) {
        await Utils.handleHttpUnexpectedError(this.centralServerProvider, error, 'sites.siteUnexpectedError', this.props.navigation);
      }
    }
    return null;
  };

  public computeDurationInfos = (transaction: Transaction) => {
    if (transaction?.stop) {
      // Compute duration
      const elapsedTimeFormatted = Utils.formatDurationHHMMSS(
        (new Date(transaction.stop.timestamp).getTime() - new Date(transaction.timestamp).getTime()) / 1000,
        false
      );
      // Compute inactivity
      const totalInactivitySecs =
        transaction.stop.totalInactivitySecs + (transaction.stop.extraInactivitySecs ? transaction.stop.extraInactivitySecs : 0);
      const inactivityFormatted = Utils.formatDurationHHMMSS(totalInactivitySecs, false);
      // Set
      this.setState({
        totalInactivitySecs,
        elapsedTimeFormatted,
        inactivityFormatted
      });
    } else {
      // Set
      this.setState({
        totalInactivitySecs: 0,
        elapsedTimeFormatted: Constants.DEFAULT_DURATION,
        inactivityFormatted: Constants.DEFAULT_DURATION
      });
    }
  };

  public renderUserInfo = (style: any) => {
    const { transaction } = this.state;
    return transaction?.user ? (
      <View style={style.columnContainer}>
        <UserAvatar size={44} user={transaction.user} navigation={this.props.navigation} />
        <Text numberOfLines={1} style={[style.label, style.labelUser, style.info]}>
          {Utils.buildUserName(transaction.user)}
        </Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <UserAvatar user={null} navigation={this.props.navigation} />
        <Text style={[style.label, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderPrice = (style: any) => {
    const { transaction } = this.state;
    return (
      <View style={style.columnContainer}>
        <Icon type="FontAwesome" name="money" style={[style.icon, style.info]} />
        <Text style={[style.label, style.labelValue, style.info]}>
          {transaction?.stop ? I18nManager.formatCurrency(transaction.stop.price, transaction.stop.priceUnit) : '-'}
        </Text>
        <Text style={[style.subLabel, style.info]}>({transaction?.stop ? transaction.stop.priceUnit : '-'})</Text>
      </View>
    );
  };

  public renderElapsedTime = (style: any) => {
    const { elapsedTimeFormatted } = this.state;
    return (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="timer" style={[style.icon, style.info]} />
        <Text style={[style.label, style.labelValue, style.info]}>{elapsedTimeFormatted}</Text>
        <Text style={[style.subLabel, style.info]}>{I18n.t('details.duration')}</Text>
      </View>
    );
  };

  public renderInactivity = (style: any) => {
    const { transaction } = this.state;
    const { inactivityFormatted } = this.state;
    const inactivityStyle = Utils.computeInactivityStyle(transaction?.stop ? transaction.stop.inactivityStatus : null);
    return (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="timer-off" style={[style.icon, inactivityStyle]} />
        <Text style={[style.label, style.labelValue, inactivityStyle]}>{inactivityFormatted}</Text>
        <Text style={[style.subLabel, inactivityStyle]}>{I18n.t('details.duration')}</Text>
      </View>
    );
  };

  public renderTotalConsumption = (style: any) => {
    const { transaction } = this.state;
    return (
      <View style={style.columnContainer}>
        <Icon style={[style.icon, style.info]} type="MaterialIcons" name="ev-station" />
        <Text style={[style.label, style.labelValue, style.info]}>
          {transaction?.stop ? I18nManager.formatNumber(Math.round(transaction.stop.totalConsumptionWh / 10) / 100) : '-'}
        </Text>
        <Text style={[style.subLabel, style.info]}>{I18n.t('details.total')} (kW.h)</Text>
      </View>
    );
  };

  public renderBatteryLevel = (style: any) => {
    const { transaction } = this.state;
    return transaction && transaction.stateOfCharge ? (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="battery-charging-full" style={[style.icon, style.info]} />
        <Text style={[style.label, style.labelValue, style.info]}>
          {transaction.stateOfCharge} {'>'} {transaction.stop.stateOfCharge}
        </Text>
        <Text style={[style.subLabel, style.info]}>(%)</Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="battery-charging-full" style={[style.icon, style.disabled]} />
        <Text style={[style.label, style.labelValue, style.disabled]}>-</Text>
      </View>
    );
  };

  public render() {
    const style = computeStyleSheet();
    const { transaction } = this.state;
    const { loading, siteImage, isPricingActive } = this.state;
    const connectorLetter = Utils.getConnectorLetterFromConnectorID(transaction ? transaction.connectorId : null);
    return loading ? (
      <Spinner style={style.spinner} color="grey" />
    ) : (
      <Container style={style.container}>
        <HeaderComponent
          navigation={this.props.navigation}
          title={transaction ? transaction.chargeBoxID : I18n.t('connector.unknown')}
          subTitle={`(${I18n.t('details.connector')} ${connectorLetter})`}
        />
        {/* Site Image */}
        <Image style={style.backgroundImage as ImageStyle} source={siteImage ? { uri: siteImage } : noSite} />
        <View style={style.headerContent}>
          <View style={style.headerRowContainer}>
            <Text style={style.headerName}>{transaction ? moment(new Date(transaction.timestamp)).format('LLL') : ''}</Text>
            <Text style={style.subHeaderName}>({transaction?.stop ? moment(new Date(transaction.stop.timestamp)).format('LLL') : ''})</Text>
            {transaction?.userID !== transaction?.stop?.userID && (
              <Text style={style.subSubHeaderName}>
                ({I18n.t('details.stoppedBy')} {Utils.buildUserName(transaction?.stop?.user)})
              </Text>
            )}
          </View>
        </View>
        <ScrollView contentContainerStyle={style.scrollViewContainer}>
          <View style={style.rowContainer}>
            {this.renderUserInfo(style)}
            {this.renderTotalConsumption(style)}
          </View>
          <View style={style.rowContainer}>
            {this.renderElapsedTime(style)}
            {this.renderInactivity(style)}
          </View>
          <View style={style.rowContainer}>
            {this.renderBatteryLevel(style)}
            {isPricingActive ? this.renderPrice(style) : <View style={style.columnContainer} />}
          </View>
        </ScrollView>
      </Container>
    );
  }
}
