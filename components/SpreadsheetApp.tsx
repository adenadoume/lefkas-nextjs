'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { debounce } from 'lodash'
import { Trash2 } from 'lucide-react'

const buildings = ['OIK50', 'OIK60', 'OIK90']
const employees = ['Elina', 'Alex', 'Ferman', 'Cleaning']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type Entry = {
  id: string
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const debouncedSave = useRef(
    debounce(async (entryData) => {
      try {
        setSaveStatus('saving')
        const response = await fetch('/api/saveEntry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryData),
        })
        const responseData = await response.json()
        if (!response.ok) {
          throw new Error(`Failed to save entry: ${JSON.stringify(responseData)}`)
        }
        console.log('Entry saved successfully:', responseData)
        setSaveStatus('saved')
      } catch (error) {
        console.error('Error saving entry:', error)
        setSaveStatus('error')
      }
    }, 500)
  ).current

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getEntries')
        if (!response.ok) {
          throw new Error('Failed to fetch entries')
        }
        const entries = await response.json()
        const processedData: { [month: string]: MonthData } = {}
        entries.forEach((entry: any) => {
          if (!processedData[entry.month]) processedData[entry.month] = {}
          if (!processedData[entry.month][entry.day]) processedData[entry.month][entry.day] = {}
          if (!processedData[entry.month][entry.day][entry.building]) processedData[entry.month][entry.day][entry.building] = []
          processedData[entry.month][entry.day][entry.building].push({
            id: entry.id,
            employee: entry.employee,
            description: entry.description,
            cost: entry.cost
          })
        })
        setData(processedData)
      } catch (error) {
        console.error('Error fetching entries:', error)
      }
    }
    fetchData()
  }, [])

  const getDaysInMonth = (month: string): number => {
    const date = new Date(new Date().getFullYear(), months.indexOf(month) + 1, 0)
    return date.getDate()
  }

  const getDayName = (month: string, day: number): string => {
    const date = new Date(new Date().getFullYear(), months.indexOf(month), day)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const handleEntryChange = useCallback((month: string, day: number, building: string, index: number, field: keyof Entry, value: string) => {
    setData((prevData: { [month: string]: MonthData }) => {
      const newData = { ...prevData }
      if (!newData[month]) newData[month] = {}
      if (!newData[month][day]) newData[month][day] = {}
      if (!newData[month][day][building]) newData[month][day][building] = []
      if (!newData[month][day][building][index]) newData[month][day][building][index] = { id: Date.now().toString(), employee: '', description: '', cost: 0 }
      newData[month][day][building][index] = {
        ...newData[month][day][building][index],
        [field]: field === 'cost' ? (value === '' ? 0 : Math.round(parseFloat(value))) : value
      }
      return newData
    })

    const entry = data[month]?.[day]?.[building]?.[index] || { id: Date.now().toString(), employee: '', description: '', cost: 0 }
    const entryData = {
      id: entry.id,
      month,
      day,
      building,
      ...entry,
      [field]: field === 'cost' ? (value === '' ? 0 : Math.round(parseFloat(value))) : value
    }

    debouncedSave(entryData)
  }, [data, debouncedSave])

  const addEntry = useCallback(async (month: string, day: number, building: string) => {
    setData((prevData: { [month: string]: MonthData }) => {
      const newData = { ...prevData }
      if (!newData[month]) newData[month] = {}
      if (!newData[month][day]) newData[month][day] = {}
      if (!newData[month][day][building]) newData[month][day][building] = []
      newData[month][day][building].push({ id: Date.now().toString(), employee: '', description: '', cost: 0 })
      return newData
    })

    try {
      setSaveStatus('saving')
      const response = await fetch('/api/saveEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Date.now().toString(),
          month,
          day,
          building,
          employee: '',
          description: '',
          cost: 0
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to save entry')
      }
      setSaveStatus('saved')
    } catch (error) {
      console.error('Error saving entry:', error)
      setSaveStatus('error')
    }
  }, [])

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

  const handleSeed = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Seeding failed');
      }
      const result = await response.json();
      console.log('Seeding successful:', result);
      // Optionally, refresh your data here
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const deleteEntry = useCallback(async (month: string, day: number, building: string, index: number) => {
    try {
      const entryId = data[month]?.[day]?.[building]?.[index]?.id
      if (!entryId) return

      const response = await fetch(`/api/deleteEntry?id=${entryId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete entry')

      setData((prevData) => {
        const newData = { ...prevData }
        newData[month][day][building].splice(index, 1)
        if (newData[month][day][building].length === 0) delete newData[month][day][building]
        if (Object.keys(newData[month][day]).length === 0) delete newData[month][day]
        if (Object.keys(newData[month]).length === 0) delete newData[month]
        return newData
      })
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }, [data])

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Building Management Spreadsheet</h1>
      <Button onClick={handleSeed} className="mb-4">Seed Data</Button>
      {saveStatus === 'saving' && <p className="text-blue-500">Saving...</p>}
      {saveStatus === 'saved' && <p className="text-green-500">Changes saved</p>}
      {saveStatus === 'error' && <p className="text-red-500">Error saving changes</p>}
      <Tabs value={selectedMonth} onValueChange={setSelectedMonth} className="mb-6">
        <TabsList className="flex flex-wrap gap-2 mb-4">
          {months.map(month => (
            <TabsTrigger 
              key={month} 
              value={month} 
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {month}
            </TabsTrigger>
          ))}
        </TabsList>
        {months.map(month => (
          <TabsContent key={month} value={month}>
            <div className="mb-4">
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded bg-white">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent className="bg-white z-10">
                  {buildings.map(building => (
                    <SelectItem key={building} value={building}>{building}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
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
                              <SelectTrigger className="w-full p-1 border border-gray-300 rounded bg-white">
                                <SelectValue placeholder="Select employee" />
                              </SelectTrigger>
                              <SelectContent className="bg-white z-10">
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
                            className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {data[month]?.[day]?.[selectedBuilding]?.map((entry, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <Input
                              type="number"
                              value={entry.cost === 0 ? '' : entry.cost}
                              onChange={(e) => handleEntryChange(month, day, selectedBuilding, index, 'cost', e.target.value)}
                              className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                            />
                            <Button
                              onClick={() => deleteEntry(month, day, selectedBuilding, index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {calculateDailyTotal(month, day, selectedBuilding).toFixed(0)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => addEntry(month, day, selectedBuilding)} 
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150 ease-in-out text-sm"
                        >
                          Add Entry
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <strong className="text-xl">Monthly Total for {selectedBuilding}: €{calculateMonthlyTotal(month, selectedBuilding).toFixed(2)}</strong>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}