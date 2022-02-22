import { SketchCanvas } from "@terrylinla/react-native-sketch-canvas";
import { encode } from "base-64";
import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import * as RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { ITenderDisplayLine, TENDER_REFUND_LINE_TYPE } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import Footer from "../common/Footer";
import { signatureStyles } from "./styles";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.payment.SignatureCapture");

export interface Props {
  amount: string;
  tenderLine: ITenderDisplayLine;
  onSave: (encoded: string, encodedDataPoints: string) => void;
  isReturnSignature?: boolean;
  isItemPickupSignature?: boolean;
}
export interface State {
}

export default class SignatureCapture extends React.Component<Props, State> {
  private signature: any;
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(signatureStyles());
  }

  public render(): JSX.Element {
    const cardType: string = this.props.tenderLine && this.props.tenderLine.tenderName || I18n.t("card");
    const cardNumber: string = this.props.tenderLine && this.props.tenderLine.cardNumber &&
        this.props.tenderLine.cardNumber.substring(this.props.tenderLine.cardNumber.length - 4);
    const isReturnTender: boolean = this.props.tenderLine && this.props.tenderLine.lineType &&
        this.props.tenderLine.lineType === TENDER_REFUND_LINE_TYPE;
    const signatureDescriptionKey: string = isReturnTender ? "signatureRefundDescription" : "signatureDescription";

    let signatureTitle = I18n.t("returnSignatureTitle");
    let signatureNote = I18n.t("returnSignatureNote");
    if (this.props.isItemPickupSignature) {
      signatureTitle = I18n.t("itemPickupSignatureTitle");
      signatureNote = "";
    }

    return (
        <View style={this.styles.root}>
          <View style={this.styles.container}>
            <Text style={this.styles.title}>
                  {(this.props.isReturnSignature || this.props.isItemPickupSignature) ?
                      signatureTitle :
                      I18n.t("signatureTotal", {amount: this.props.amount})
                  }
            </Text>
            {cardNumber &&
              <Text style={this.styles.description}>{I18n.t(signatureDescriptionKey, {cardType, cardNumber})}</Text>
            }
            <View style={this.styles.signatureBox}>
              <SketchCanvas
                  style={this.styles.signature}
                  ref={(ref: any) => this.signature = ref } />
            </View>
            {!isReturnTender &&
              <Text style={this.styles.agreement}>
                    {this.props.isReturnSignature || this.props.isItemPickupSignature ?
                      signatureNote :
                      I18n.t("signatureNote")}</Text>
            }
          </View>
          <Footer style={this.styles.footer}>
            <TouchableOpacity
              onPress={() => this.signature.clear()}
              style={[this.styles.btnSeconday, this.styles.button]}
            >
              <Text style={this.styles.btnSecondayText}>
                {I18n.t("clear")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.signature.getBase64("png", false, true, false, false, this.saveEvent.bind(this))}
              style={[this.styles.btnPrimary, this.styles.button]}
            >
              <Text style={this.styles.btnPrimaryText}>
                {I18n.t("accept")}
              </Text>
            </TouchableOpacity>
          </Footer>
        </View>
    );
  }

  private saveEvent(error: any, result: string): void {
    const dataPoints: string[][] = [];
    this.signature.getPaths().forEach((line: any) => {
      dataPoints.push(line.path.data);
    });
    if (dataPoints.length === 0) {
      return;
    }
    const encodedDataPoints: string = this.convertDataPoints(dataPoints);

    if (error) {
      logger.catching(error, "Error while saving the base64 image");
      this.props.onSave(`data:image/png;base64,${result}`, encodedDataPoints);
    } else {
      // Get the base64 of the original signature file (png) and based on the length it gets a factor to apply to the
      // quality so the final jpeg doesn't exceed the max 20kb supported by the final device
      const factor: number = Math.ceil(result.length / 20480);

      const updatedResult: string = `data:image/png;base64,${result}`;

      // The signature would be retained when poping for multiple sigs in a row,
      // due to component not unmounting, added clear on save to resolve.
      this.signature.clear();

      // Get the image width and height to scale it proportionally
      Image.getSize(updatedResult, (width: number, height: number) => {
        ImageResizer.createResizedImage(updatedResult, width / 2, height / 2,
            "JPEG", Math.floor(100 / factor)).then(({uri, size}) => {
          return RNFS.readFile(uri, "base64");
        }).then((encoded) => {
          this.props.onSave(`data:image/jpeg;base64,${encoded}`, encodedDataPoints);
        }).catch((err) => {
          logger.catching(err, `Error while converting ${updatedResult} to JPEG`);
          this.props.onSave(`data:image/png;base64,${result}`, encodedDataPoints);
        });
      }, (err: any) => {
        logger.catching(err, `Error while getting the size for ${result}`);
        this.props.onSave(`data:image/png;base64,${result}`, encodedDataPoints);
      });
    }
  }

  private convertDataPoints(dataPoints: string[][]): string {
    const byteArray: number[] = [];

    dataPoints.forEach((segment: string[]) => {
      segment.forEach((points: string) => {
          const splitPoints: string[] = points.split(",");
          const x: number = +splitPoints[0];
          const y: number = +splitPoints[1];
          // tslint:disable-next-line:no-bitwise
          byteArray.push(x & 0xFF);
          // tslint:disable-next-line:no-bitwise
          byteArray.push((x & 0xFF00) >> 8);
          // tslint:disable-next-line:no-bitwise
          byteArray.push(y & 0xFF);
          // tslint:disable-next-line:no-bitwise
          byteArray.push((y & 0xFF00) >> 8);
      });
      // pen up
      byteArray.push(0xFF, 0xFF, 0xFF, 0xFF);
    });

    return encode(String.fromCharCode(...new Uint8Array(byteArray)));
  }
}
