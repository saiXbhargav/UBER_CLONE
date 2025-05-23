
import { validationResult } from 'express-validator';

const mapservice=require('../services/maps.service');

module.exports.getCoordinate=async (req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,
            message:errors.array()[0].msg
        });
    }
    const {address}=req.query;
    try {
        const coordinates=await mapservice.getCoordinate(address);
        res.status(200).json({
            success:true,
            coordinates
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}
