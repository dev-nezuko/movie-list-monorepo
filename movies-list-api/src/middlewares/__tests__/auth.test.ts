import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import middleware from '../auth';
import User from '../../models/user';
jest.mock('../../models/user');
const key='synthetic-unit-test-signing-value-only';
const original=process.env.JWT_SECRET;
beforeEach(()=>{process.env.JWT_SECRET=key;jest.clearAllMocks();});
afterAll(()=>{if(original===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=original;});
function response(){return {status:jest.fn().mockReturnThis(),json:jest.fn().mockReturnThis()} as unknown as Response;}
test('valid signature still requires the active stored token',async()=>{
 const token=jwt.sign({userId:'synthetic-user'},key,{algorithm:'HS256'});
 (User.findOne as jest.Mock).mockResolvedValue(null);
 const req={header:()=>`Bearer ${token}`} as unknown as Request;const res=response();const next=jest.fn();
 await middleware(req,res,next);expect(res.status).toHaveBeenCalledWith(401);expect(next).not.toHaveBeenCalled();
 expect(User.findOne).toHaveBeenCalledWith({_id:'synthetic-user',authToken:token});
});
test('a matching stored token authenticates its owner',async()=>{
 const token=jwt.sign({userId:'synthetic-user'},key,{algorithm:'HS256'});const user={_id:'synthetic-user'};
 (User.findOne as jest.Mock).mockResolvedValue(user);
 const req={header:()=>`Bearer ${token}`} as unknown as Request;const next=jest.fn();
 await middleware(req,response(),next);expect(req.user).toBe(user);expect(next).toHaveBeenCalledTimes(1);
});
test('invalid schemes and signatures cannot reach the account lookup',async()=>{
 for(const header of ['Basic invalid','Bearer '+jwt.sign({userId:'synthetic-user'},'different-synthetic-key')]){
  const res=response();await middleware({header:()=>header} as unknown as Request,res,jest.fn());expect(res.status).toHaveBeenCalledWith(401);
 }
 expect(User.findOne).not.toHaveBeenCalled();
});
