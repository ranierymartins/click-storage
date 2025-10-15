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
      accessories: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          stock: number | null
          category: string | null
          brand: string | null
          serial_numbers: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          stock?: number | null
          category?: string | null
          brand?: string | null
          serial_numbers?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          stock?: number | null
          category?: string | null
          brand?: string | null
          serial_numbers?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_accessories: {
        Row: {
          id: string
          customer_id: string
          accessory_id: string
          quantity: number
          serial_numbers: Json
          assigned_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          accessory_id: string
          quantity?: number
          serial_numbers?: Json
          assigned_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          accessory_id?: string
          quantity?: number
          serial_numbers?: Json
          assigned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_accessories_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_accessories_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_products: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          quantity: number
          serial_numbers: Json
          assigned_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          quantity?: number
          serial_numbers?: Json
          assigned_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          quantity?: number
          serial_numbers?: Json
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
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          
        ]
      }
      maintenance_items: {
        Row: {
          id: string
          original_product_id: string | null
          name: string
          description: string | null
          price: number | null
          stock: number | null
          brand: string | null
          serial_numbers: Json
          company_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          original_product_id?: string | null
          name: string
          description?: string | null
          price?: number | null
          stock?: number | null
          brand?: string | null
          serial_numbers?: Json
          company_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          original_product_id?: string | null
          name?: string
          description?: string | null
          price?: number | null
          stock?: number | null
          brand?: string | null
          serial_numbers?: Json
          company_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          stock: number | null
          category: string | null
          brand: string | null
          serial_numbers: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          stock?: number | null
          category?: string | null
          brand?: string | null
          serial_numbers?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          stock?: number | null
          category?: string | null
          brand?: string | null
          serial_numbers?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
