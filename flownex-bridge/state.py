# flownex-bridge/state.py
from __future__ import annotations

import csv
from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class InputDef:
    """Definition for an input parameter"""
    key: str
    rawKey: str
    description: str
    unit: str
    componentIdentifier: str
    propertyIdentifier: str
    editType: str  # e.g., "slider", "text", etc.
    defaultValue: float = 0.0
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None


@dataclass
class OutputDef:
    """Definition for an output parameter"""
    key: str
    rawKey: str
    description: str
    unit: str
    componentIdentifier: str
    propertyIdentifier: str


class BridgeState:
    """
    Maintains the state of inputs, outputs, and configuration for the bridge.
    """

    def __init__(self):
        self.connected_project: Optional[str] = None
        
        # Schema definitions
        self.inputs_def: Dict[str, InputDef] = {}
        self.outputs_def: Dict[str, OutputDef] = {}
        
        # Current state values
        self.inputs: Dict[str, Dict[str, Any]] = {
            "dynamic": {},
            "static": {},
        }
        self.outputs: Dict[str, Any] = {}
        
        # Status
        self.status: Dict[str, Any] = {
            "state": "idle",
            "message": "Ready",
            "progress": 0.0,
        }

    def load_schema_from_csv(self, inputs_csv: str, outputs_csv: str) -> None:
        """Load input and output definitions from CSV files"""
        # Load inputs
        self.inputs_def = {}
        with open(inputs_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row.get('Key', '').strip()
                if not key:
                    continue
                    
                input_def = InputDef(
                    key=key,
                    rawKey=row.get('Raw Key', key),
                    description=row.get('Description', ''),
                    unit=row.get('Unit', ''),
                    componentIdentifier=row.get('Component Identifier', ''),
                    propertyIdentifier=row.get('Property Identifier', ''),
                    editType=row.get('Edit Type', 'slider'),
                    defaultValue=float(row.get('Default', 0)),
                    min=float(row['Min']) if row.get('Min') else None,
                    max=float(row['Max']) if row.get('Max') else None,
                    step=float(row['Step']) if row.get('Step') else None,
                )
                self.inputs_def[key] = input_def
                
                # Initialize input values with defaults
                scope = row.get('Scope', 'dynamic').lower()
                if scope not in self.inputs:
                    self.inputs[scope] = {}
                self.inputs[scope][key] = input_def.defaultValue

        # Load outputs
        self.outputs_def = {}
        with open(outputs_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row.get('Key', '').strip()
                if not key:
                    continue
                    
                output_def = OutputDef(
                    key=key,
                    rawKey=row.get('Raw Key', key),
                    description=row.get('Description', ''),
                    unit=row.get('Unit', ''),
                    componentIdentifier=row.get('Component Identifier', ''),
                    propertyIdentifier=row.get('Property Identifier', ''),
                )
                self.outputs_def[key] = output_def
                self.outputs[key] = 0.0  # Initialize with default

    def set_input(self, scope: str, key: str, value: Any) -> tuple[str, str, Any]:
        """
        Set an input value and return (scope, key, value) tuple.
        The tuple is used by server.py to echo the change back to WebSocket clients.
        """
        if scope not in self.inputs:
            self.inputs[scope] = {}
        self.inputs[scope][key] = value
        return (scope, key, value)

    def set_output(self, key: str, value: Any) -> None:
        """Set an output value"""
        self.outputs[key] = value

    def state_dict(self) -> Dict[str, Any]:
        """Return current state as a dictionary"""
        return {
            "inputs": self.inputs,
            "outputs": self.outputs,
        }

    def schema_dict(self) -> Dict[str, Any]:
        """Return schema definitions as a dictionary"""
        inputs_schema = []
        for input_def in self.inputs_def.values():
            inputs_schema.append({
                "key": input_def.key,
                "rawKey": input_def.rawKey,
                "description": input_def.description,
                "unit": input_def.unit,
                "componentIdentifier": input_def.componentIdentifier,
                "propertyIdentifier": input_def.propertyIdentifier,
                "editType": input_def.editType,
                "defaultValue": input_def.defaultValue,
                "min": input_def.min,
                "max": input_def.max,
                "step": input_def.step,
            })

        outputs_schema = []
        for output_def in self.outputs_def.values():
            outputs_schema.append({
                "key": output_def.key,
                "rawKey": output_def.rawKey,
                "description": output_def.description,
                "unit": output_def.unit,
                "componentIdentifier": output_def.componentIdentifier,
                "propertyIdentifier": output_def.propertyIdentifier,
            })

        return {
            "inputs": inputs_schema,
            "outputs": outputs_schema,
        }

    def status_dict(self) -> Dict[str, Any]:
        """Return current status as a dictionary"""
        return self.status
