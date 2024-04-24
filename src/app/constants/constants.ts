export const NODE_URL: string = "https://testnode.propelapps.com/";

export class ApiSettings {
    static LOGIN = `${NODE_URL}EBS/20D/login`;
    static INVENTORY_ORG = `${NODE_URL}EBS/20D/getInventoryOrganizations/''`;
    static INVENTORY_ORG_TABLE = `${NODE_URL}EBS/23A/getInventoryOrganizationsTable/`;
    static DOCS4RECEIVING = `${NODE_URL}EBS/20D/getDocumentsForReceiving/`;
    static MOVE_ORDERS = `${NODE_URL}EBS/20D/getMoveOrders/`;
    static CREATE_GOODS_RECEIPT = `${NODE_URL}EBS/20D/createGoodsReceiptTransactions`;
    static SUB_INVENTORY = `${NODE_URL}EBS/20D/getSubinventories/`;
    static REASONS = `${NODE_URL}EBS/20D/getreasons/`
    static LOCATORS = `${NODE_URL}EBS/20D/getLocators/`
    static GL_PERIODS = `${NODE_URL}EBS/20D/getGLPeriods/`
    static INVENTORY_PERIODS = `${NODE_URL}EBS/20D/getInventoryPeriods/`
    static PURCHASING_PERIODS = `${NODE_URL}EBS/20D/getPurchasingPeriods/`
    static LOTS = `${NODE_URL}EBS/22A/getLotsTableType/`
    static SERIALS = `${NODE_URL}EBS/22A/getSerialTableType/`
    static UOM = `${NODE_URL}EBS/20D/getUnitOfMeasuresConversions/`
    static REVISIONS = `${NODE_URL}EBS/20D/getItemRevisions/`
}


export enum TableNames {
    LOGIN = "LOGIN",
    USERS = "USERS",
    ORGANIZATIONS = "ORGANIZATIONS",
    DOCS4RECEIVING = "DOCS4RECEIVING",
    TRANSACTIONS = "TRANSACTIONS",
    SUB_INVENTORY = "SUB_INVENTORY",
    GET_REASONS = "GET_REASONS",
    LOCATORS = "LOCATORS",
    GL_PERIODS = "GL_PERIODS",
    INVENTORY_PERIODS = "INVENTRY_PERIODS",
    PURCHASING_PERIODS = "PURCHASING_PERIODS",
    LOTS = "LOTS",
    SERIALS = "SERIALS",
    UOM = "UOM",
    REVISIONS = "REVISIONS",
}

export enum TypeOfApi {
    METADATA = 'metadata',
    CONFIG = 'config',
    GET_DATA = 'data'
}


export enum RESPONSIBILITIES {
    GL_PERIODS = "GL_PERIODS",
    PURCHASING_PERIODS = "PURCHASING_PERIODS",
    INVENTORY_PERIODS = "INVENTORY_PERIODS",
    GET_REASONS = "GET_REASONS",
    DOCS4RECEIVING = "GOODS_RECEIPT",
    SUB_INVENTORY = "SUB_INVENTORY",
    LOCATORS = "LOCATORS",
    SERIALS = "SERIALS",
    LOTS = "LOTS",
    UOM = "UOM",
    REVISIONS = "REVISIONS",

}

export enum TransactionType {
    POST = "POST",
    DELTA_SYNC = "DELTA_SYNC",
  }
  

  export enum Color {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    TERTIARY = "tertiary",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "danger",
    LIGHT = "light",
    MEDIUM = "medium",
    DARK = "dark",
  }
  
  export enum MESSAGES {
    SUCCESS = "Success",
    FAILED = "Failed",
    ERROR = "Error",
    UNAUTHORIZED = "Unauthorized",
    TIMEOUT = "Timeout",
    NO_INTERNET = "Please check your internet connection and try again.",
  }