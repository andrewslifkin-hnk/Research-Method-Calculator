"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MATRIX_DATA } from "./data/matrix-data"

export default function DecisionMatrix() {
  const [matrixData] = useState(MATRIX_DATA)
  const columns = matrixData.length > 0 ? Object.keys(matrixData[0]) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision Matrix Reference</CardTitle>
        <CardDescription>
          Reference table showing recommended research methods based on feature attributes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrixData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>{row[column]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
