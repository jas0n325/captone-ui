import * as React from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image } from "react-native";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { IAttachment } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { tillAdditionalDetailStyles } from "./styles";
import { renderTextInputField } from "../common/FieldValidation";
import Camera from "../common/Camera";
import Header from "../common/Header";
import ImageThumbnail from "../common/ImageThumbnail";
import { warnBeforeLosingChanges } from "../common/utilities";

interface PaidAddReceiptForm {
  description: string;
}

interface Props {
  handleCancelLinkAddReceipt: () => void;
  handleAddReceipt: (paidReceiptAttachements: IAttachment[], userComments: string, imageData: ImageData[]) => void;
  imageData: ImageData[];
  userComments: string;
  maximumAttachments: number;
}

export interface ImageData {
  base64: string;
  height: string;
  uri: string;
  width: string;
}

interface State {
  description: string;
  enableCamera: boolean;
  images: ImageData[];
  isAddPhotoButtonDisable: boolean;
  enableImagePreview: boolean;
  imagePreviewUri: string;
}

class PaidAddReceipt extends React.Component<Props & InjectedFormProps<PaidAddReceiptForm, Props> &
FormInstance<PaidAddReceiptForm, undefined>, State> {
  private styles: any;

  public constructor(props: Props & InjectedFormProps<PaidAddReceiptForm, Props> &
    FormInstance<PaidAddReceiptForm, undefined>) {
    super(props);
    this.state = {
      description: this.props.userComments,
      enableCamera: false,
      images: this.props.imageData,
      isAddPhotoButtonDisable : (this.props.imageData.length >= this.props.maximumAttachments) ? true : false,
      enableImagePreview: false,
      imagePreviewUri: undefined
    };
    this.styles = Theme.getStyles(tillAdditionalDetailStyles());
    this.props.initialize({ description: this.props.userComments });
  }

  public render(): JSX.Element {
    return (
      <>
        { this.renderHeader() }
        <View style={this.styles.root}>
          {
            !this.state.enableCamera && !this.state.enableImagePreview &&
            <>
              <View style={this.styles.descriptionHeader}>
                <Field
                  name={`description`}
                  component={renderTextInputField}
                  placeholder={I18n.t("description")}
                  style={this.styles.field}
                  inputStyle={this.styles.inputField}
                  multiline={true}
                  numberOfLines={2}
                  persistPlaceholder={true}
                  value={this.state.description}
                  onChange={this.updateDescription.bind(this)}
                />
              </View>
              <ScrollView>
                <View style={this.styles.imagesOptionsArea}>
                  <FlatList
                    numColumns={2}
                    style={this.styles.list}
                    data={this.state.images}
                    keyExtractor={(item: ImageData) => item.uri}
                    renderItem={({ item, index }) => {
                      return <ImageThumbnail
                        item= {item}
                        index= {index}
                        removeImage= {this.removeImage.bind(this)}
                        previewImage= {this.previewImage.bind(this)}
                      />;
                    }}
                  />
                  {
                    !this.state.isAddPhotoButtonDisable &&
                    <TouchableOpacity
                      style={[this.styles.btnSeconday, this.styles.receiptButton]}
                      onPress={this.handleAddPhoto.bind(this)}
                    >
                      <Text style={[this.styles.btnSecondayText]}>{I18n.t("addPhoto")}</Text>
                    </TouchableOpacity>
                  }
                </View>
              </ScrollView>
            </>
          }
          {
            this.state.enableCamera && !this.state.enableImagePreview &&
            <Camera handleImages={this.handleImages.bind(this)} />
          }
          {
            !this.state.enableCamera && this.state.enableImagePreview &&
            <View style={this.styles.imagePreviewArea} >
              <Image source={{ uri: this.state.imagePreviewUri }} style={this.styles.imagePreview} resizeMode="contain"  />
            </View>
          }
        </View>
      </>
    );
  }

  private handleBackFromCamera(): void {
    this.setState({ enableCamera : false});
  }

  private renderHeader = (): JSX.Element => {
    if (this.state.enableCamera) {
      return (
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("addReceipt")}
          renderInSingleLine={true}
          backButton={{
            name: "Back",
            action: this.handleBackFromCamera.bind(this)
          }}
        />
      );
    } else if (this.state.enableImagePreview) {
      return (
        <Header
          isVisibleTablet={Theme.isTablet}
          renderInSingleLine={true}
          backButton={{
            name: "Cancel",
            action: this.handleBackFromPreviewImage.bind(this)
          }}
        />
      );
    } else {
      return (
        <Header
          isVisibleTablet={Theme.isTablet}
          title={I18n.t("addReceipt")}
          renderInSingleLine={false}
          backButton={{
            name: "Back",
            action: () =>  warnBeforeLosingChanges((this.props.dirty || this.props.imageData !== this.state.images),
                this.props.handleCancelLinkAddReceipt.bind(this))
          }}
          rightButton={this.state.images.length > 0 && {
            title: I18n.t("proceed"),
            action: this.handleAddReceipt.bind(this)
          }}
        />
      );
    }
  }

  private previewImage(uri: string): void {
    this.setState({ enableImagePreview : true, imagePreviewUri : uri});
  }

  private handleBackFromPreviewImage(): void {
    this.setState({ enableImagePreview : false});
  }

  private removeImage(uri: string): void {
    const images = this.state.images.filter(item => item.uri !== uri);
    this.setState({ images, isAddPhotoButtonDisable : false });
  }

  private updateDescription(values: string): void {
    this.setState({description: values})
  }

  private handleAddReceipt(): void {
    const attachements: IAttachment[] = [];
    this.state.images.forEach((item: ImageData) => {
      const attachement: IAttachment = {
        type: 'Image',
        data: item.base64
      }
      attachements.push(attachement);
    })
    this.props.handleAddReceipt(attachements, this.state.description, this.state.images);
  }

  private handleAddPhoto(): void {
    this.setState({enableCamera: true});
  }

  private handleImages(data: any): void {
    let images = this.state.images;
    images = [data, ...images];
    this.setState({images, enableCamera : false});
    if (this.state.images.length >= this.props.maximumAttachments) {
      this.setState({ isAddPhotoButtonDisable : true});
    }
  }
}

export default reduxForm<PaidAddReceiptForm, Props>({
  form: "PaidAddReceiptForm",
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  initialValues: { description: undefined }
})(PaidAddReceipt);
