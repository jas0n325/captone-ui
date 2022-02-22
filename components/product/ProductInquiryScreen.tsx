import * as React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { StoreItem } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  dataEvent,
  DataEventType,
  IKeyedData,
  productInquiryClear,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  ProductInquiryState,
  SettingsState,
  UiState,
  UI_MODE_PRODUCT_INQUIRY
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import { renderInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import { cameraScannerInputStyles } from "../common/styles";
import ProductInquiryLine from "../common/ProductInquiryLine";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { productInquiryScreenStyle } from "./styles";


export interface StateProps {
  businessState: BusinessState;
  settings: SettingsState;
  uiState: UiState;
  productInquiryState: ProductInquiryState;
}

export interface DispatchProps {
  updateUiMode: ActionCreator;
  productInquiryClear: ActionCreator;
  dataEventRequest: ActionCreator;
}

export interface Props extends StateProps, DispatchProps, NavigationScreenProps<"productInquiry"> {}

export interface State {
  inputValue: string;
  searched: boolean;
}

export interface ProductInquiryForm {
  searchValue: string;
}

class ProductInquiryScreen extends React.Component<Props & InjectedFormProps<ProductInquiryForm, Props> &
FormInstance<ProductInquiryForm, undefined>, State> {
  private styles: any;
  private inputStyles: any;
  private testID: string;

  public constructor(props: Props & InjectedFormProps<ProductInquiryForm, Props> &
      FormInstance<ProductInquiryForm, undefined>) {
    super(props);

    this.state = {
      inputValue: "",
      searched: false
    };

    this.styles = Theme.getStyles(productInquiryScreenStyle());
    this.inputStyles = Theme.getStyles(cameraScannerInputStyles());
    this.testID = "ProductInquiryScreen";
  }

  public componentWillMount(): void {
    this.props.productInquiryClear();
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_PRODUCT_INQUIRY);
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.productInquiryState.inProgress !== this.props.productInquiryState.inProgress) {
      this.checkRedirection(prevProps);
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
   const { handleSubmit } = this.props;
   return (
      <BaseView style={this.styles.fill}>
        <Header
          testID={this.testID}
          isVisibleTablet={true}
          title={I18n.t("productInquiry")}
          backButton={{
            name: "Back",
            action: this.pop,
            title: this.getBackButtonTitle()
          }}
          rightButton={{
            title: I18n.t("searchButton"),
            action: handleSubmit((data: ProductInquiryForm) => this.searchItems(data, 0))
          }}
        />
        <View style={this.styles.root}>
          { this.renderProductinquiryForm() }
          { this.renderProductInquiryResult() }
        </View>
      </BaseView>
    );
  }

  private getBackButtonTitle(): string {
    if (Theme.isTablet){
        return I18n.t("basket");
    } else {
      return "";
    }
  }

  private renderProductinquiryForm(): JSX.Element {
    const { handleSubmit } = this.props;
    const fieldName = "searchValue";
    const inputStyles = this.inputStyles;

    return (
      <View style={this.styles.fieldWrapper}>
        <Field
          name={fieldName}
          testID={`${this.testID}-${fieldName}`}
          component={renderInputField}
          overrideOnSubmitEditing={handleSubmit(
              (data: ProductInquiryForm) => this.searchItems(data, 0))}
          returnKeyType={"search"}
          inputContainerStyle={inputStyles.transparentBackground}
          style={inputStyles.inputPanel}
          inputStyle={inputStyles.inputField}
          cameraIcon={{
            icon: "Camera",
            size: inputStyles.cameraIcon.fontSize,
            color: inputStyles.cameraIcon.color,
            position: "right",
            style: inputStyles.cameraIconPanel
          }}
          placeholder={I18n.t("enterOrScanItem")}
          placeholderStyle={inputStyles.placeholderStyle}
          settings={this.props.settings}
          inputType={InputType.text}
        />
      </View>
    );
  }

  private showProductDetail(item: StoreItem): void {
    this.props.reset();
    this.props.navigation.navigate("productInquiryDetail", { item });
  }

  private searchItems(data: ProductInquiryForm, offset: number): void {
    if (data && data.searchValue && data.searchValue.length) {
      const keyedData: IKeyedData = {
        inputText: data.searchValue
      };
      this.props.dataEventRequest(DataEventType.KeyedData, keyedData, {
        limit: 20,
        offset
      });
      this.setState({ inputValue: "",  searched: false });
    }
  }

  private renderResultTile(): JSX.Element {
    return (
      <View style={this.styles.resultHeader}>
        <Text style={this.styles.resultHeaderText}>
          {
            I18n.t("resultsFound", {
              totalCount: this.props.productInquiryState.items ?
                this.props.productInquiryState.paginationMetadata.totalCount :
                0
            })
          }
        </Text>
      </View>
    );
  }

  private renderProductInquiryResult(): JSX.Element {
    const {productInquiryState, handleSubmit} = this.props;
    const {paginationMetadata} = productInquiryState;
    const footer = () => (
      <View style={this.styles.pagination}>
        <View style={this.styles.paginationButtonView}>
          {
            paginationMetadata.offset > 0 &&
            <TouchableOpacity
                style={this.styles.paginationButton}
                onPress={handleSubmit((data: ProductInquiryForm) =>
                    this.searchItems(data, paginationMetadata.offset - paginationMetadata.limit))}
            >
              <Text style={this.styles.paginationButtonTitle}>{I18n.t("previous")}</Text>
            </TouchableOpacity>
          }
        </View>
        <View style={this.styles.paginationButtonView}>
          {
            (paginationMetadata.offset + paginationMetadata.limit <= paginationMetadata.totalCount) &&
            <TouchableOpacity
                style={this.styles.paginationButton}
                onPress={handleSubmit((data: ProductInquiryForm) =>
                    this.searchItems(data, paginationMetadata.limit + paginationMetadata.offset))}
            >
              <Text style={this.styles.paginationButtonTitle}>{I18n.t("next")}</Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    );

    return productInquiryState.items && (
      <FlatList
        data={productInquiryState.items}
        keyExtractor={(item) => item.uniqueId.toString()}
        renderItem={this.renderRow.bind(this)}
        ListHeaderComponent={
          this.state.searched && !this.props.productInquiryState.inProgress && !Theme.isTablet ?
              this.renderResultTile() : undefined}
        ListFooterComponent={footer}
      />
    );
  }

  private renderRow({ item: line }: { item: StoreItem, index: number }): JSX.Element {
    const displayLine: StoreItem = line as StoreItem;
    return <ProductInquiryLine settings={this.props.settings} item={displayLine}
                               showProductDetail={this.showProductDetail.bind(this)} />;
  }

  /**
   * @param prevProps
   * If items found then we check if length 1 got to detail screen,
   * else go to result screen;
   * If we got error which is no item found, then navigate to result screen
   * with 0 item found.
   */
  private checkRedirection(prevProps: Props): void {
    this.setState({ searched: true });
    if (!prevProps.productInquiryState.items && this.props.productInquiryState.items) {
      if (this.props.productInquiryState.items.length === 1) {
        this.showProductDetail(this.props.productInquiryState.items[0]);
      }
    } else if (!this.props.productInquiryState.items && this.props.productInquiryState.error) {
      setTimeout(
        () => Alert.alert(I18n.t("noResults"), undefined, [{ text: I18n.t("ok") }], { cancelable: true }),
        250
      );
    }
  }

  private pop = () => {
    this.props.navigation.pop();
  }
}

const ProductInquiryForm = reduxForm<ProductInquiryForm, Props>({
  form: "productInquiry",
  validate : (values: ProductInquiryForm) => {
    const errors: { searchValue: string } = { searchValue: undefined };
    if (!values.searchValue) {
      errors.searchValue = I18n.t("itemDescriptionMissing");
    }
    return errors;
  },
  initialValues: { searchValue: undefined }
})(ProductInquiryScreen);
function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    settings: state.settings,
    uiState: state.uiState,
    productInquiryState: state.productInquiry
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  productInquiryClear: productInquiryClear.request,
  dataEventRequest: dataEvent.request,
  updateUiMode: updateUiMode.request
})(ProductInquiryForm);
