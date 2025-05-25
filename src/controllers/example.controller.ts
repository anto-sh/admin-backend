import { Request, Response } from "express";
import * as exampleService from "../services/example.service";
import {
  CreateExampleDto,
  UpdateExampleDto,
  ExampleResponseDto,
} from "../models/dto/example.dto";
import { Example } from "../models/entities/example.entity";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

const toResponseDto = (entity: Example): ExampleResponseDto => ({
  id: entity.id,
  name: entity.name,
  value: entity.value,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

export const createExample = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateExampleDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const example = await exampleService.createExample(dto);
    res.status(201).json(toResponseDto(example));
  } catch (error) {
    res.status(500).json({ message: "Error creating example" });
  }
};

export const getExample = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const example = await exampleService.getExampleById(id);

    if (!example) {
      return res.status(404).json({ message: "Example not found" });
    }

    res.json(toResponseDto(example));
  } catch (error) {
    res.status(500).json({ message: "Error fetching example" });
  }
};

export const getAllExamples = async (req: Request, res: Response) => {
  try {
    const examples = await exampleService.getAllExamples();
    res.json(examples.map(toResponseDto));
  } catch (error) {
    res.status(500).json({ message: "Error fetching examples" });
  }
};

export const updateExample = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateExampleDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const example = await exampleService.updateExample(id, dto);

    if (!example) {
      return res.status(404).json({ message: "Example not found" });
    }

    res.json(toResponseDto(example));
  } catch (error) {
    res.status(500).json({ message: "Error updating example" });
  }
};

export const deleteExample = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await exampleService.deleteExample(id);

    if (!success) {
      return res.status(404).json({ message: "Example not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting example" });
  }
};
