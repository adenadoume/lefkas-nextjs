'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const buildings = ['OIK50', 'OIK60', 'OIK90']
const employees = ['Elina', 'Alex', 'Ferman', 'Cleaning']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type Entry = {
  employee: string
  description: string
  cost: number
}

type DayData = {
  [building: string]: Entry[]
}

type MonthData = {
  [day: number]: DayData
}

export default function SpreadsheetApp() {
  const [data, setData] = useState<{ [month: string]: MonthData }>({})
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()])
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0])

  const getDaysInMonth = (month: string): number => {
    const date = new Date(new Date().getFullYear(), months.indexOf(month) + 1, 0)
    return date.getDate()
  }

  const getDayName = (month: string, day: number): string => {
    const date = new Date(new Date().getFullYear(), months.indexOf(month), day)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const handleEntryChange = (month: string, day: number, building: string, index: number, field: keyof Entry, value: string) => {
    setData((prevData: { [month: string]: MonthData }) => {
      const newData = { ...prevData }
      if (!newData[month]) newData[month] = {}
      if (!newData[month][day]) newData[month][day] = {}
      if (!newData[month][day][building]) newData[month][day][building] = []
      if (!newData[month][day][building][index]) newData[month][day][building][index] = { employee: '', description: '', cost: 0 }
      newData[month][day][building][index] = {
        ...newData[month][day][building][index],
        [field]: field === 'cost' ? parseFloat(value) : value
      }
      return newData
    })
  }

  const addEntry = (month: string, day: number, building: string) => {
    setData((prevData: { [month: string]: MonthData }) => {
      const newData = { ...prevData }
      if (!newData[month]) newData[month] = {}
      if (!newData[month][day]) newData[month][day] = {}
      if (!newData[month][day][building]) newData[month][day][building] = []
      newData[month][day][building].push({ employee: '', description: '', cost: 0 })
      return newData
    })
  }

  const calculateDailyTotal = (month: string, day: number, building: string): number => {
    return data[month]?.[day]?.[building]?.reduce((sum: number, entry: Entry) => sum + (entry.cost || 0), 0) || 0
  }

  const calculateMonthlyTotal = (month: string, building: string): number => {
    let total = 0
    for (let day = 1; day <= getDaysInMonth(month); day++) {
      total += calculateDailyTotal(month, day, building)
    }
    return total
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Building Management Spreadsheet</h1>
      <Tabs value={selectedMonth} onValueChange={setSelectedMonth} className="mb-6">
        <TabsList className="flex space-x-2 mb-4">
          {months.map(month => (
            <TabsTrigger 
              key={month} 
              value={month} 
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-t-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {month}
            </TabsTrigger>
          ))}
        </TabsList>
        {months.map(month => (
          <TabsContent key={month} value={month}>
            <div className="mb-4">
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map(building => (
                    <SelectItem key={building} value={building}>{building}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-800">Date</TableHead>
                  <TableHead className="text-gray-800">Day</TableHead>
                  <TableHead className="text-gray-800">Employee</TableHead>
                  <TableHead className="text-gray-800">Description</TableHead>
                  <TableHead className="text-gray-800">Cost (€)</TableHead>
                  <TableHead className="text-gray-800">Daily Total (€)</TableHead>
                  <TableHead className="text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1).map(day => (
                  <TableRow key={day} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <TableCell>{day}</TableCell>
                    <TableCell>{getDayName(month, day)}</TableCell>
                    <TableCell>
                      {data[month]?.[day]?.[selectedBuilding]?.map((entry, index) => (
                        <div key={index} className="mb-2">
                          <Select
                            value={entry.employee}
                            onValueChange={(value) => handleEntryChange(month, day, selectedBuilding, index, 'employee', value)}
                          >
                            <SelectTrigger className="w-full p-1 border border-gray-300 rounded">
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {data[month]?.[day]?.[selectedBuilding]?.map((entry, index) => (
                        <Input
                          key={index}
                          value={entry.description}
                          onChange={(e) => handleEntryChange(month, day, selectedBuilding, index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {data[month]?.[day]?.[selectedBuilding]?.map((entry, index) => (
                        <Input
                          key={index}
                          type="number"
                          value={entry.cost}
                          onChange={(e) => handleEntryChange(month, day, selectedBuilding, index, 'cost', e.target.value)}
                          placeholder="Cost"
                          className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {calculateDailyTotal(month, day, selectedBuilding).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => addEntry(month, day, selectedBuilding)} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150 ease-in-out"
                      >
                        Add Entry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 text-right text-xl font-bold">
              <strong>Monthly Total for {selectedBuilding}: €{calculateMonthlyTotal(month, selectedBuilding).toFixed(2)}</strong>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}