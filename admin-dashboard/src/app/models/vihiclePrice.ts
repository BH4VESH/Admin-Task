export interface VehiclePrice {
    _id?:string
    countryId: string;
    cityId: string;
    vehicleId: string;
    Driver_Profit: number;
    min_fare: number;
    Distance_for_base_price: number;
    Base_price: number;
    Price_per_Unit_Distance: number;
    Price_per_Unit_time: number;
    Max_space: number;
  }