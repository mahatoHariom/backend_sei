export interface PaymentData {
  amount: number
  failure_url: string
  product_delivery_charge: string
  product_service_charge: string
  product_code: string
  signed_field_names: string
  success_url: string
  tax_amount: string
  total_amount: number
  transaction_uuid: string
  signature?: string // Add signature as optional
}
