export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          stock: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          price?: number
          stock?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          stock?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_products: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          quantity: number
          assigned_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          quantity?: number
          assigned_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          quantity?: number
          assigned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_products_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_serial_numbers: {
        Row: {
          id: string
          product_id: string
          serial_number: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          serial_number: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          serial_number?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_serial_numbers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}