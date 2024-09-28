'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

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
    <div className="spreadsheet-container">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Building Management Spreadsheet</h1>
      <Tabs value={selectedMonth} onValueChange={setSelectedMonth} className="month-tabs">
        <TabsList>
          {months.map(month => (
            <TabsTrigger key={month} value={month} className="month-tab">{month}</TabsTrigger>
          ))}
        </TabsList>
        {months.map(month => (
          <TabsContent key={month} value={month}>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding} className="building-select">
              <SelectTrigger>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map(building => (
                  <SelectItem key={building} value={building}>{building}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Day</TableHead>
                  <TableHead className="text-foreground">Employee</TableHead>
                  <TableHead className="text-foreground">Description</TableHead>
                  <TableHead className="text-foreground">Cost (€)</TableHead>
                  <TableHead className="text-foreground">Daily Total (€)</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1).map(day => (
                  <TableRow key={day} className="spreadsheet-row">
                    <TableCell>{day}</TableCell>
                    <TableCell>{getDayName(month, day)}</TableCell>
                    <TableCell>
                      {data[month]?.[day]?.[selectedBuilding]?.map((entry, index) => (
                        <Select
                          key={index}
                          value={entry.employee}
                          onValueChange={(value) => handleEntryChange(month, day, selectedBuilding, index, 'employee', value)}
                          className="spreadsheet-select"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map(emp => (
                              <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </TableCell>
                    <TableCell>
                      {data[month]?.[day]?.[selectedBuilding]?.map((entry, index) => (
                        <Input
                          key={index}
                          value={entry.description}
                          onChange={(e) => handleEntryChange(month, day, selectedBuilding, index, 'description', e.target.value)}
                          placeholder="Description"
                          className="spreadsheet-input"
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
                          className="spreadsheet-input"
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {calculateDailyTotal(month, day, selectedBuilding).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => addEntry(month, day, selectedBuilding)} className="spreadsheet-button">
                        Add Entry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="total-display">
              <strong>Monthly Total for {selectedBuilding}: €{calculateMonthlyTotal(month, selectedBuilding).toFixed(2)}</strong>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}