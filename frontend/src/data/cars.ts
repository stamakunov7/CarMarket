export interface CarModel {
  name: string;
  generations: string[];
}

export interface CarMake {
  make: string;
  models: CarModel[];
}

export const carData: CarMake[] = [
  {
    make: "Toyota",
    models: [
      {
        name: "Camry",
        generations: ["XV40 (2006-2011)", "XV50 (2011-2017)", "XV70 (2017-2023)", "XV80 (2023-present)"]
      },
      {
        name: "Corolla",
        generations: ["E150 (2006-2013)", "E170 (2013-2018)", "E210 (2018-present)"]
      },
      {
        name: "Prius",
        generations: ["XW20 (2003-2009)", "XW30 (2009-2015)", "XW50 (2015-2022)", "XW60 (2022-present)"]
      },
      {
        name: "RAV4",
        generations: ["XA30 (2005-2012)", "XA40 (2012-2018)", "XA50 (2018-present)"]
      },
      {
        name: "Highlander",
        generations: ["XU40 (2007-2013)", "XU50 (2013-2019)", "XU70 (2019-present)"]
      }
    ]
  },
  {
    make: "Honda",
    models: [
      {
        name: "Civic",
        generations: ["8th Gen (2005-2011)", "9th Gen (2011-2015)", "10th Gen (2015-2021)", "11th Gen (2021-present)"]
      },
      {
        name: "Accord",
        generations: ["8th Gen (2007-2012)", "9th Gen (2012-2017)", "10th Gen (2017-2022)", "11th Gen (2022-present)"]
      },
      {
        name: "CR-V",
        generations: ["3rd Gen (2006-2011)", "4th Gen (2011-2016)", "5th Gen (2016-2022)", "6th Gen (2022-present)"]
      },
      {
        name: "Pilot",
        generations: ["2nd Gen (2008-2015)", "3rd Gen (2015-2022)", "4th Gen (2022-present)"]
      }
    ]
  },
  {
    make: "BMW",
    models: [
      {
        name: "3 Series",
        generations: ["E90 (2005-2012)", "F30 (2011-2019)", "G20 (2018-present)"]
      },
      {
        name: "5 Series",
        generations: ["E60 (2003-2010)", "F10 (2009-2017)", "G30 (2016-present)"]
      },
      {
        name: "X3",
        generations: ["E83 (2003-2010)", "F25 (2010-2017)", "G01 (2017-present)"]
      },
      {
        name: "X5",
        generations: ["E70 (2006-2013)", "F15 (2013-2018)", "G05 (2018-present)"]
      }
    ]
  },
  {
    make: "Mercedes-Benz",
    models: [
      {
        name: "C-Class",
        generations: ["W204 (2007-2014)", "W205 (2014-2021)", "W206 (2021-present)"]
      },
      {
        name: "E-Class",
        generations: ["W212 (2009-2016)", "W213 (2016-2023)", "W214 (2023-present)"]
      },
      {
        name: "GLC",
        generations: ["X253 (2015-2022)", "X254 (2022-present)"]
      },
      {
        name: "GLE",
        generations: ["W166 (2011-2019)", "W167 (2019-present)"]
      }
    ]
  },
  {
    make: "Audi",
    models: [
      {
        name: "A4",
        generations: ["B8 (2007-2015)", "B9 (2015-2023)", "B10 (2023-present)"]
      },
      {
        name: "A6",
        generations: ["C7 (2011-2018)", "C8 (2018-present)"]
      },
      {
        name: "Q5",
        generations: ["8R (2008-2017)", "FY (2017-present)"]
      },
      {
        name: "Q7",
        generations: ["4L (2005-2015)", "4M (2015-present)"]
      }
    ]
  },
  {
    make: "Ford",
    models: [
      {
        name: "F-150",
        generations: ["12th Gen (2008-2014)", "13th Gen (2014-2020)", "14th Gen (2020-present)"]
      },
      {
        name: "Mustang",
        generations: ["S197 (2004-2014)", "S550 (2014-2023)", "S650 (2023-present)"]
      },
      {
        name: "Explorer",
        generations: ["4th Gen (2005-2010)", "5th Gen (2010-2019)", "6th Gen (2019-present)"]
      },
      {
        name: "Escape",
        generations: ["2nd Gen (2007-2012)", "3rd Gen (2012-2019)", "4th Gen (2019-present)"]
      }
    ]
  },
  {
    make: "Chevrolet",
    models: [
      {
        name: "Silverado",
        generations: ["GMT900 (2006-2013)", "K2XX (2013-2018)", "T1XX (2018-present)"]
      },
      {
        name: "Camaro",
        generations: ["5th Gen (2009-2015)", "6th Gen (2015-2023)", "7th Gen (2023-present)"]
      },
      {
        name: "Equinox",
        generations: ["2nd Gen (2009-2017)", "3rd Gen (2017-present)"]
      },
      {
        name: "Malibu",
        generations: ["8th Gen (2008-2012)", "9th Gen (2012-2015)", "10th Gen (2015-2023)"]
      }
    ]
  },
  {
    make: "Nissan",
    models: [
      {
        name: "Altima",
        generations: ["4th Gen (2006-2012)", "5th Gen (2012-2018)", "6th Gen (2018-present)"]
      },
      {
        name: "Sentra",
        generations: ["B16 (2006-2012)", "B17 (2012-2019)", "B18 (2019-present)"]
      },
      {
        name: "Rogue",
        generations: ["T32 (2013-2020)", "T33 (2020-present)"]
      },
      {
        name: "Pathfinder",
        generations: ["R51 (2004-2012)", "R52 (2012-2021)", "R53 (2021-present)"]
      }
    ]
  },
  {
    make: "Hyundai",
    models: [
      {
        name: "Elantra",
        generations: ["HD (2006-2010)", "MD (2010-2015)", "AD (2015-2020)", "CN7 (2020-present)"]
      },
      {
        name: "Sonata",
        generations: ["NF (2004-2010)", "YF (2009-2014)", "LF (2014-2019)", "DN8 (2019-present)"]
      },
      {
        name: "Tucson",
        generations: ["LM (2009-2015)", "TL (2015-2021)", "NX4 (2021-present)"]
      },
      {
        name: "Santa Fe",
        generations: ["CM (2006-2012)", "DM (2012-2018)", "TM (2018-present)"]
      }
    ]
  },
  {
    make: "Kia",
    models: [
      {
        name: "Optima",
        generations: ["TF (2010-2015)", "JF (2015-2020)", "DL3 (2020-present)"]
      },
      {
        name: "Forte",
        generations: ["YD (2008-2013)", "JD (2013-2018)", "BD (2018-present)"]
      },
      {
        name: "Sportage",
        generations: ["SL (2010-2015)", "QL (2015-2021)", "NQ5 (2021-present)"]
      },
      {
        name: "Sorento",
        generations: ["XM (2009-2014)", "UM (2014-2020)", "MQ4 (2020-present)"]
      }
    ]
  },
  {
    make: "Porsche",
    models: [
      {
        name: "911",
        generations: ["997 (2004-2012)", "991 (2011-2019)", "992 (2018-present)"]
      },
      {
        name: "Cayman",
        generations: ["987 (2005-2012)", "981 (2012-2016)", "718 (2016-present)"]
      },
      {
        name: "Boxster",
        generations: ["987 (2004-2012)", "981 (2012-2016)", "718 (2016-present)"]
      },
      {
        name: "Macan",
        generations: ["95B (2014-2021)", "95B (2021-present)"]
      }
    ]
  },
  {
    make: "Lexus",
    models: [
      {
        name: "ES",
        generations: ["XV40 (2006-2012)", "XV60 (2012-2018)", "XV70 (2018-present)"]
      },
      {
        name: "IS",
        generations: ["XE20 (2005-2013)", "XE30 (2013-2020)", "XE40 (2020-present)"]
      },
      {
        name: "RX",
        generations: ["AL10 (2008-2015)", "AL20 (2015-2022)", "AL30 (2022-present)"]
      },
      {
        name: "GX",
        generations: ["J150 (2009-present)"]
      }
    ]
  }
];

// Engine sizes in liters
export const engineSizes = [
  "1.0L", "1.2L", "1.4L", "1.5L", "1.6L", "1.8L", "2.0L", "2.2L", "2.3L", "2.4L", 
  "2.5L", "2.7L", "3.0L", "3.2L", "3.5L", "3.6L", "4.0L", "4.2L", "4.6L", "5.0L", 
  "5.2L", "5.7L", "6.0L", "6.2L", "6.4L", "8.0L"
];

// Transmission types
export const transmissionTypes = [
  "Manual",
  "Automatic", 
  "CVT",
  "Semi-automatic",
  "Dual-clutch"
];

// Drivetrain types
export const drivetrainTypes = [
  "FWD",
  "RWD", 
  "AWD",
  "4WD"
];

// Fuel types
export const fuelTypes = [
  "Gasoline",
  "Diesel",
  "Hybrid",
  "Electric",
  "Plug-in Hybrid",
  "Flex Fuel"
];

// Body types
export const bodyTypes = [
  "Sedan",
  "SUV",
  "Hatchback", 
  "Coupe",
  "Convertible",
  "Wagon",
  "Pickup Truck",
  "Van",
  "Crossover"
];

// Car conditions
export const carConditions = [
  "Excellent",
  "Very Good",
  "Good", 
  "Fair",
  "Poor"
];

// Customs status
export const customsStatus = [
  "Cleared",
  "Not Cleared",
  "In Process"
];

// Steering wheel positions
export const steeringWheelPositions = [
  "Left",
  "Right"
];
